import type { ChatMessage } from '@lib/chat';
import type { ActionType } from '@lib/ollama/actions/types';
import type { AbortableAsyncIterator } from 'ollama';
import type { ProgressResponse } from 'ollama/browser';
import { Ollama } from 'ollama/browser';
import { INTENT_ACTION_PROMPT_DESCRIPTION, INTENT_ACTION_SHORT_DESCRIPTIONS, INTENT_ACTIONS } from './ollama.constants';

const MIN_USER_MESSAGE_LENGTH = 100;
const MIN_ASSISTANT_MESSAGE_LENGTH = 200;
const MAX_RECENT_SUMMARIES = 10;

export const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

function getElectronAPI(): ElectronAPI {
  if (!window.electronAPI) {
    throw new Error('window.electronAPI is not available outside of Electron');
  }
  return window.electronAPI;
}

export interface OllamaChatStream {
  [Symbol.asyncIterator](): AsyncIterator<{ message: { content: string } }>;
  abort(): void;
}

/**
 * Intent detection — classifies the user's current message into a supported action type.
 */
const INTENT_DETECTION_PROMPT = `
You are Demmi's AI assistant, specialized in cooking, recipes, meal planning, and nutrition.

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
  let allModels: string[];

  if (isElectron) {
    allModels = await getElectronAPI().ollamaListModels();
  } else {
    const response = await ollamaClient.list();
    allModels = response.models.map((m) => m.name);
  }

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
 * Streams a chat completion, routing through Electron IPC when available.
 * Returns an async iterable that yields chunks of `{ message: { content: string } }`.
 */
export async function ollamaChatStream(params: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  format?: string | object;
  options?: Record<string, unknown>;
}): Promise<OllamaChatStream> {
  if (isElectron) {
    const api = getElectronAPI();
    const queue: Array<{ message: { content: string } }> = [];
    let isDone = false;
    let aborted = false;
    let streamError: Error | null = null;
    let wakeUp: (() => void) | null = null;

    api.onOllamaChunk((data) => {
      if (!aborted) {
        queue.push({ message: { content: data.content } });
        wakeUp?.();
        wakeUp = null;
      }
    });

    api.onOllamaDone(() => {
      isDone = true;
      wakeUp?.();
      wakeUp = null;
    });

    api.onOllamaError((data) => {
      streamError = new Error(data.error);
      isDone = true;
      wakeUp?.();
      wakeUp = null;
    });

    void api.ollamaChat({
      model: params.model,
      messages: params.messages,
      format: params.format as unknown,
      options: params.options as unknown,
      stream: true,
    }).catch((err: unknown) => {
      streamError = err instanceof Error ? err : new Error('Stream failed');
      isDone = true;
      wakeUp?.();
      wakeUp = null;
    });

    async function* generate() {
      try {
        while ((!isDone || queue.length > 0) && !aborted) {
          if (streamError && queue.length === 0) {
            throw streamError;
          }
          if (queue.length > 0) {
            const chunk = queue.shift();
            if (chunk) yield chunk;
          } else {
            await new Promise<void>((resolve) => {
              wakeUp = resolve;
            });
          }
        }
        if (streamError && !aborted) {
          throw streamError;
        }
      } finally {
        api.removeOllamaListeners();
      }
    }

    const iter = generate();
    return Object.assign(iter, {
      abort: () => {
        aborted = true;
        wakeUp?.();
        wakeUp = null;
      },
    });
  }

  const stream = await ollamaClient.chat({ ...params, stream: true });
  return stream as unknown as OllamaChatStream;
}

/**
 * Performs a non-streaming chat completion, routing through Electron IPC when available.
 */
export async function ollamaChatSingle(params: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  format?: string | object;
  options?: Record<string, unknown>;
}): Promise<{ message: { content: string } }> {
  if (isElectron) {
    const result = await getElectronAPI().ollamaChat({
      model: params.model,
      messages: params.messages,
      format: params.format as unknown,
      options: params.options as unknown,
      stream: false,
    });
    return result ?? { message: { content: '' } };
  }

  return ollamaClient.chat({ ...params, stream: false });
}

/**
 * Performs a non-streaming generate call, routing through Electron IPC when available.
 */
export async function ollamaGenerate(params: {
  model: string;
  prompt: string;
  format?: string | object;
}): Promise<{ response: string }> {
  if (isElectron) {
    const result = await getElectronAPI().ollamaGenerate({
      model: params.model,
      prompt: params.prompt,
      format: params.format as unknown,
      stream: false,
    });
    return result ?? { response: '' };
  }

  return ollamaClient.generate({ ...params, stream: false });
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
    const response = await ollamaGenerate({
      model,
      prompt: `Summarize this exchange in 2-4 sentences. Include key topics, requests, and important context:\n\nUser: ${userMessage}\n\nAssistant: ${assistantMessage}\n\nSummary:`,
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
    const response = await ollamaGenerate({
      model,
      prompt,
      format: INTENT_DETECTION_SCHEMA,
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
