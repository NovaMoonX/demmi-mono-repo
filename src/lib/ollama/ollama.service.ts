import type { ChatMessage } from '@lib/chat';
import {
  INGREDIENT_TYPES,
  MEASUREMENT_UNITS,
  type IngredientType,
  type MeasurementUnit,
} from '@lib/ingredients';
import { MEAL_CATEGORIES, type MealCategory } from '@lib/meals';
import type { ActionType } from '@lib/ollama/actions/types';
import type { AbortableAsyncIterator } from 'ollama';
import type { ChatResponse, ProgressResponse } from 'ollama/browser';
import { Ollama } from 'ollama/browser';
import { INTENT_ACTION_PROMPT_DESCRIPTION, INTENT_ACTION_SHORT_DESCRIPTIONS, INTENT_ACTIONS } from './ollama.constants';
import { AgentMealProposal } from './action-types/createMealAction.types';

const MIN_USER_MESSAGE_LENGTH = 100;
const MIN_ASSISTANT_MESSAGE_LENGTH = 200;
const MAX_RECENT_SUMMARIES = 10;

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
- Previous: "What's a good protein for breakfast?" (general) → Current: "Create an egg benedict recipe" (createMeal)
- Previous: "Make me a pasta dish" (createMeal) → Current: "What's the difference between penne and rigatoni?" (general)

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

/**
 * Phase 1b.1 — general response.
 * Called after action is detected as "general". Returns a conversational response.
 */
const GENERAL_RESPONSE_PROMPT = `
You are Demmi's AI assistant, specialized in cooking, recipes, meal planning, and nutrition.

**CONTEXT**: The user's intent has been classified as 'general conversation' for THIS message — they are NOT requesting meal creation right now.

Your task: Provide a helpful, conversational response to their current question or comment.
- Be concise, friendly, and practical
- Share cooking tips, techniques, ingredient information, nutrition advice, or answer their questions
- If they ask about recipes, you can discuss them, but you're NOT creating/generating a new recipe in this response
- Note: The user can ask you to create a meal in their next message — each message is evaluated independently
`;

const GENERAL_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['response'],
  properties: {
    response: {
      type: 'string',
      description: 'Your message to the user (supports markdown)',
    },
  },
};

/**
 * Phase 1b.2 — meal name proposal.
 * Called after action is detected as "wantsToCreateMeal". Returns the proposed meal name.
 */
const MEAL_NAME_PROPOSAL_PROMPT = `
You are Demmi's AI assistant.

**CONTEXT**: The user wants to create a meal. Extract the exact name of that meal from their message.

STRICT RULES (follow every one, no exceptions):
- Maximum 3 words. Never exceed this.
- Use ONLY the words the user actually said. Do NOT add ingredients, adjectives, or descriptors they didn't mention.
- No parentheses, no dashes, no subtitles.
- Proper capitalization (e.g. "Turkey Burger", not "turkey burger").
- If the user said "turkey burger", output "Turkey Burger" — nothing else.
- Never embellish: forbidden patterns include "with X and Y", "Healthy ...", "Classic ...", "Easy ...", parenthetical notes, etc.

EXAMPLES:
  User: "I want to make a turkey burger" → "Turkey Burger"
  User: "can you create a spaghetti carbonara recipe" → "Spaghetti Carbonara"
  User: "make me a grilled cheese" → "Grilled Cheese"
  User: "create a chicken tikka masala" → "Chicken Tikka Masala"
`;

const MEAL_NAME_PROPOSAL_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['proposedMealName'],
  properties: {
    proposedMealName: {
      type: 'string',
      description:
        "The meal name using only words the user mentioned — maximum 3 words, no embellishments",
    },
  },
};

/**
 * Phase 2 — recipe generation.
 * Called after the user has confirmed intent. Generates the full recipe details.
 */
const RECIPE_GENERATION_PROMPT = `
You are Demmi's AI assistant.

**CONTEXT**: The user has confirmed they want to create a meal. You are now generating the complete recipe details.

Your task: Generate a complete, detailed recipe for the requested meal.
`;

const RECIPE_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['response', 'meals'],
  properties: {
    response: {
      type: 'string',
    },
    meals: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'title',
          'description',
          'category',
          'prepTime',
          'cookTime',
          'servingSize',
          'instructions',
          'ingredients',
        ],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          category: {
            type: 'string',
            enum: MEAL_CATEGORIES,
          },
          prepTime: { type: 'integer', minimum: 0 },
          cookTime: { type: 'integer', minimum: 0 },
          servingSize: { type: 'integer', minimum: 1 },
          instructions: { type: 'array', items: { type: 'string' } },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'type', 'unit', 'servings'],
              properties: {
                name: { type: 'string' },
                type: {
                  type: 'string',
                  enum: INGREDIENT_TYPES,
                },
                unit: {
                  type: 'string',
                  enum: MEASUREMENT_UNITS,
                },
                servings: { type: 'number', minimum: 0 },
              },
            },
          },
        },
      },
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
 * Returns the ActionType: 'general' | 'createMeal'.
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

    if (action === 'general' || action === 'createMeal') {
      return action;
    }

    return 'general';
  } catch {
    return 'general';
  }
}

/**
 * Phase 1b.1: Streaming response for general conversation.
 * Called after action is detected as "general".
 */
export async function getGeneralResponse(
  model: string,
  messages: ChatMessage[],
): Promise<AbortableAsyncIterator<ChatResponse>> {
  const ollamaMessages = [
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.rawContent ?? m.content,
    })),
    { role: 'system' as const, content: GENERAL_RESPONSE_PROMPT },
  ];

  return ollamaClient.chat({
    model,
    messages: ollamaMessages,
    stream: true,
    format: GENERAL_RESPONSE_SCHEMA,
  });
}

/**
 * Phase 1b.2: Get proposed meal name (non-streaming).
 * Called after action is detected as "wantsToCreateMeal".
 */
export async function getMealNameProposal(
  model: string,
  messages: ChatMessage[],
): Promise<string | null> {
  const ollamaMessages = [
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.rawContent ?? m.content,
    })),
    { role: 'system' as const, content: MEAL_NAME_PROPOSAL_PROMPT },
  ];

  try {
    const response = await ollamaClient.chat({
      model,
      messages: ollamaMessages,
      stream: false,
      format: MEAL_NAME_PROPOSAL_SCHEMA,
    });

    const parsed = JSON.parse(response.message.content);
    const proposedMealName = parsed?.proposedMealName;

    return typeof proposedMealName === 'string' ? proposedMealName : null;
  } catch {
    return null;
  }
}

/**
 * Phase 2: Non-streaming recipe generation after user confirms intent.
 * Returns the parsed meal proposal, or null on failure.
 */
export async function generateRecipe(
  model: string,
  mealName: string,
): Promise<ParsedOllamaResponse | null> {
  const response = await ollamaClient.chat({
    model,
    messages: [
      { role: 'system' as const, content: RECIPE_GENERATION_PROMPT },
      { role: 'user' as const, content: `Create a recipe for: ${mealName}` },
    ],
    stream: false,
    format: RECIPE_RESPONSE_SCHEMA,
  });

  return parseOllamaResponse(response.message.content);
}

export async function pullModelStream(
  model: string,
): Promise<AbortableAsyncIterator<ProgressResponse>> {
  return ollamaClient.pull({ model, stream: true });
}

function coerceMealCategory(value: string): MealCategory {
  return (
    MEAL_CATEGORIES.includes(value as MealCategory) ? value : 'dinner'
  ) as MealCategory;
}

function coerceIngredientType(value: string): IngredientType {
  return (
    INGREDIENT_TYPES.includes(value as IngredientType) ? value : 'other'
  ) as IngredientType;
}

function coerceMeasurementUnit(value: string): MeasurementUnit {
  return (
    MEASUREMENT_UNITS.includes(value as MeasurementUnit) ? value : 'other'
  ) as MeasurementUnit;
}

export interface ParsedOllamaResponse {
  response: string;
  meals: AgentMealProposal[];
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
 * Parse the Phase 2 (recipe generation) JSON response.
 */
export function parseOllamaResponse(json: string): ParsedOllamaResponse | null {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const response = typeof parsed.response === 'string' ? parsed.response : '';

    const rawMeals = Array.isArray(parsed.meals) ? parsed.meals : [];
    const meals: AgentMealProposal[] = rawMeals
      .filter(
        (m: unknown): m is Record<string, unknown> =>
          typeof m === 'object' && m !== null,
      )
      .map((m: Record<string, unknown>) => ({
        title: typeof m.title === 'string' ? m.title : 'Untitled Meal',
        description: typeof m.description === 'string' ? m.description : '',
        category: coerceMealCategory(
          typeof m.category === 'string' ? m.category : '',
        ),
        prepTime:
          typeof m.prepTime === 'number'
            ? Math.max(0, Math.round(m.prepTime))
            : 0,
        cookTime:
          typeof m.cookTime === 'number'
            ? Math.max(0, Math.round(m.cookTime))
            : 0,
        servingSize:
          typeof m.servingSize === 'number'
            ? Math.max(1, Math.round(m.servingSize))
            : 1,
        instructions: Array.isArray(m.instructions)
          ? m.instructions.filter((i: unknown) => typeof i === 'string')
          : [],
        imageUrl: '',
        ingredients: Array.isArray(m.ingredients)
          ? m.ingredients
              .filter(
                (i: unknown): i is Record<string, unknown> =>
                  typeof i === 'object' && i !== null,
              )
              .map((i: Record<string, unknown>) => ({
                name: typeof i.name === 'string' ? i.name : 'Unknown',
                type: coerceIngredientType(
                  typeof i.type === 'string' ? i.type : '',
                ),
                unit: coerceMeasurementUnit(
                  typeof i.unit === 'string' ? i.unit : '',
                ),
                servings:
                  typeof i.servings === 'number' ? Math.max(1, i.servings) : 1,
              }))
          : [],
      }));

    return { response, meals };
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
