import type { ChatMessage } from '@lib/chat';
import type { ActionType } from '@lib/ollama/actions/types';
import type { AbortableAsyncIterator } from 'ollama';
import type { ProgressResponse } from 'ollama/browser';
import { Ollama } from 'ollama/browser';
import { INTENT_ACTION_PROMPT_DESCRIPTION, INTENT_ACTION_SHORT_DESCRIPTIONS, INTENT_ACTIONS } from './ollama.constants';

const MIN_USER_MESSAGE_LENGTH = 100;
const MIN_ASSISTANT_MESSAGE_LENGTH = 200;
const MAX_RECENT_SUMMARIES = 10;

/**
 * Intent detection — classifies the user's current message into a supported action type.
 */
const INTENT_DETECTION_PROMPT = `
You are Demmi's AI assistant, specialized in cooking, recipes, recipe planning, and nutrition.

Your task: Classify the user's CURRENT message intent.

Select ONE action that best matches what the user wants RIGHT NOW:
${INTENT_ACTIONS.map((a) => `- "${a}": ${INTENT_ACTION_PROMPT_DESCRIPTION[a]}`).join('\n')}

IMPORTANT CLASSIFICATION RULES:
- Re-evaluate intent with EVERY message — users can transition between action types at any time
- Focus ONLY on the user's CURRENT request, ignoring previous conversation context

TRANSITION EXAMPLES (users can switch at any time):
- Previous: "What's a good protein for breakfast?" (general) → Current: "Create an egg benedict recipe" (createRecipe)
- Previous: "Make me a pasta dish" (createRecipe) → Current: "What's the difference between penne and rigatoni?" (general)

Each message is independent — classify based on what the user wants NOW.
`;

const INTENT_DETECTION_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['action'],
  properties: {
    action: {
      type: 'string',
      enum: INTENT_ACTIONS,
      description:
        `The type of user intent:\n{${INTENT_ACTIONS.map((a) => `— "${a}": ${INTENT_ACTION_SHORT_DESCRIPTIONS[a]}`).join('\n')}}`,
    },
  },
};

export const ollamaClient = new Ollama();

export async function listLocalModels(): Promise<string[]> {
  const response = await ollamaClient.list();
  const allModels = response.models.map((m) => m.name);

  const textModels = allModels.filter((name) => {
    const lowerName = name.toLowerCase();
    return (
      !lowerName.includes('embed') &&
      !lowerName.includes('vision') &&
      !lowerName.includes('multimodal')
    );
  });

  return textModels;
}

/**
 * Generate a 2-4 sentence summary of a user/assistant exchange.
 * Async and non-blocking — returns empty string for short exchanges or on error.
 */
export async function generateSummary(
  model: string,
  userMessage: string,
  assistantMessage: string,
): Promise<string> {
  if (userMessage.length < MIN_USER_MESSAGE_LENGTH && assistantMessage.length < MIN_ASSISTANT_MESSAGE_LENGTH) {
    return '';
  }

  try {
    const response = await ollamaClient.generate({
      model,
      prompt: `Summarize this exchange in 2-4 sentences. Include key topics, requests, and important context:\n\nUser: ${userMessage}\n\nAssistant: ${assistantMessage}\n\nSummary:`,
      stream: false,
    });

    return response.response.trim();
  } catch {
    return '';
  }
}

/**
 * Detect the user's action type using summaries for context when available.
 * Uses generate() API for classification. Falls back to full messages if no summaries exist.
 * Returns the ActionType: 'general' | 'createRecipe'.
 */
export async function detectIntent(
  model: string,
  messages: ChatMessage[],
): Promise<ActionType> {
  const recentSummaries = messages
    .slice(-MAX_RECENT_SUMMARIES)
    .filter((m) => m.summary)
    .map((m) => m.summary)
    .join('\n');

  const lastMessage = messages[messages.length - 1];
  const currentMessage = lastMessage?.rawContent ?? lastMessage?.content ?? '';

  let prompt: string;

  if (recentSummaries) {
    prompt = `${INTENT_DETECTION_PROMPT}
Recent context:
${recentSummaries}

Current user message:
${currentMessage}

Classify the current message intent.`;
  } else {
    const conversationText = messages
      .map((m) => `${m.role}: ${m.rawContent ?? m.content}`)
      .join('\n');
    prompt = `${INTENT_DETECTION_PROMPT}
Conversation:
${conversationText}

Classify the current message intent.`;
  }

  try {
    const response = await ollamaClient.generate({
      model,
      prompt,
      format: INTENT_DETECTION_SCHEMA,
      stream: false,
    });

    const parsed = JSON.parse(response.response);
    const action = parsed?.action;

    if (action === 'general' || action === 'createRecipe') {
      return action;
    }

    return 'general';
  } catch {
    return 'general';
  }
}

export async function pullModelStream(
  model: string,
): Promise<AbortableAsyncIterator<ProgressResponse>> {
  return ollamaClient.pull({ model, stream: true });
}

export interface ParsedGeneralResponse {
  response: string;
}

/**
 * Parse the Phase 1b.1 (general response) JSON response.
 */
export function parseGeneralResponse(
  json: string,
): ParsedGeneralResponse | null {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const response = typeof parsed.response === 'string' ? parsed.response : '';
    return { response };
  } catch {
    return null;
  }
}


/**
 * Extract partial "response" text from an in-progress JSON stream.
 * Used for Phase 1b.1 (general response streaming).
 * Allows progressive display while the full JSON is still building.
 */
export function extractPartialResponse(partialJson: string): string {
  const match = partialJson.match(/"response"\s*:\s*"((?:[^"\\]|\\.)*)"?/s);
  if (!match) return '';

  try {
    return JSON.parse('"' + match[1] + '"') as string;
  } catch {
    return '';
  }
}
