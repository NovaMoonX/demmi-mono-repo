import { updateMessageContent, updateAgentActionStatus } from '@store/slices/chatsSlice';
import type { MealCategory } from '@lib/meals';
import type { IngredientType, MeasurementUnit } from '@lib/ingredients';
import type { AgentMealProposal } from '@lib/chat/agent-actions.types';
import { ollamaClient } from '../ollama.service';
import {
  MEAL_NAME_PROMPT,
  MEAL_INFO_PROMPT,
  MEAL_DESCRIPTION_PROMPT,
  MEAL_INGREDIENTS_PROMPT,
  MEAL_INSTRUCTIONS_PROMPT,
} from '../prompts/meal.prompts';
import {
  MEAL_NAME_SCHEMA,
  MEAL_INFO_SCHEMA,
  MEAL_DESCRIPTION_SCHEMA,
  MEAL_INGREDIENTS_SCHEMA,
  MEAL_INSTRUCTIONS_SCHEMA,
} from '../schemas/meal.schemas';
import type { ActionHandler, ActionStep, StepContext, StepResult, StepRuntime } from './types';

const MAX_CONTEXT_MESSAGES = 3;

export interface MealResult extends Record<string, unknown> {
  name: string;
  category: MealCategory;
  servings: number;
  totalTime: number;
  description: string;
  ingredients: Array<{ name: string; type: IngredientType; unit: MeasurementUnit; servings: number }>;
  instructions: string[];
}

export type MealStepName =
  | 'proposeName'
  | 'generateBasicInfo'
  | 'generateDescription'
  | 'generateIngredients'
  | 'generateInstructions';

const proposeNameStep: ActionStep<MealResult, 'proposeName'> = {
  name: 'proposeName',
  prompt: MEAL_NAME_PROMPT,
  schema: MEAL_NAME_SCHEMA,

  async execute(
    model: string,
    context: StepContext<MealResult>,
    runtime: StepRuntime,
  ): Promise<StepResult<MealResult, 'proposeName'>> {
    const { messages } = context;
    const { abortSignal } = runtime;

    if (abortSignal?.aborted) {
      return { stepName: 'proposeName', data: {}, cancelled: true };
    }

    const response = await ollamaClient.chat({
      model,
      messages: [
        { role: 'system', content: MEAL_NAME_PROMPT },
        ...messages.slice(-MAX_CONTEXT_MESSAGES).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.rawContent ?? m.content,
        })),
      ],
      stream: false,
      format: MEAL_NAME_SCHEMA,
    });

    if (abortSignal?.aborted) {
      return { stepName: 'proposeName', data: {}, cancelled: true };
    }

    const parsed = JSON.parse(response.message.content);
    const name: string = parsed.name ?? '';

    return { stepName: 'proposeName', data: { name } };
  },
};

const generateBasicInfoStep: ActionStep<MealResult, 'generateBasicInfo'> = {
  name: 'generateBasicInfo',
  prompt: MEAL_INFO_PROMPT,
  schema: MEAL_INFO_SCHEMA,

  async execute(
    model: string,
    context: StepContext<MealResult>,
    runtime: StepRuntime,
  ): Promise<StepResult<MealResult, 'generateBasicInfo'>> {
    const { abortSignal } = runtime;
    const name = context.previousResults?.name ?? '';

    if (abortSignal?.aborted) {
      return { stepName: 'generateBasicInfo', data: {}, cancelled: true };
    }

    const response = await ollamaClient.chat({
      model,
      messages: [
        { role: 'system', content: MEAL_INFO_PROMPT },
        { role: 'user', content: `Meal name: ${name}` },
      ],
      stream: false,
      format: MEAL_INFO_SCHEMA,
    });

    if (abortSignal?.aborted) {
      return { stepName: 'generateBasicInfo', data: {}, cancelled: true };
    }

    const parsed = JSON.parse(response.message.content);
    const result = {
      category: (parsed.category ?? 'dinner') as MealCategory,
      servings: Number(parsed.servings) || 4,
      totalTime: Number(parsed.totalTime) || 30,
    };

    return { stepName: 'generateBasicInfo', data: result };
  },
};

const generateDescriptionStep: ActionStep<MealResult, 'generateDescription'> = {
  name: 'generateDescription',
  prompt: MEAL_DESCRIPTION_PROMPT,
  schema: MEAL_DESCRIPTION_SCHEMA,

  async execute(
    model: string,
    context: StepContext<MealResult>,
    runtime: StepRuntime,
  ): Promise<StepResult<MealResult, 'generateDescription'>> {
    const { abortSignal } = runtime;
    const name = context.previousResults?.name ?? '';

    if (abortSignal?.aborted) {
      return { stepName: 'generateDescription', data: {}, cancelled: true };
    }

    const response = await ollamaClient.chat({
      model,
      messages: [
        { role: 'system', content: MEAL_DESCRIPTION_PROMPT },
        { role: 'user', content: `Meal name: ${name}` },
      ],
      stream: false,
      format: MEAL_DESCRIPTION_SCHEMA,
    });

    if (abortSignal?.aborted) {
      return { stepName: 'generateDescription', data: {}, cancelled: true };
    }

    const parsed = JSON.parse(response.message.content);
    const description: string = parsed.description ?? '';

    return { stepName: 'generateDescription', data: { description } };
  },
};

const generateIngredientsStep: ActionStep<MealResult, 'generateIngredients'> = {
  name: 'generateIngredients',
  prompt: MEAL_INGREDIENTS_PROMPT,
  schema: MEAL_INGREDIENTS_SCHEMA,

  async execute(
    model: string,
    context: StepContext<MealResult>,
    runtime: StepRuntime,
  ): Promise<StepResult<MealResult, 'generateIngredients'>> {
    const { abortSignal } = runtime;
    const name = context.previousResults?.name ?? '';
    const servings = context.previousResults?.servings ?? 4;

    if (abortSignal?.aborted) {
      return { stepName: 'generateIngredients', data: {}, cancelled: true };
    }

    const response = await ollamaClient.chat({
      model,
      messages: [
        { role: 'system', content: MEAL_INGREDIENTS_PROMPT },
        { role: 'user', content: `Meal name: ${name}\nServings: ${servings}` },
      ],
      stream: false,
      format: MEAL_INGREDIENTS_SCHEMA,
    });

    if (abortSignal?.aborted) {
      return { stepName: 'generateIngredients', data: {}, cancelled: true };
    }

    const parsed = JSON.parse(response.message.content);
    const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];

    return { stepName: 'generateIngredients', data: { ingredients } };
  },
};

const generateInstructionsStep: ActionStep<MealResult, 'generateInstructions'> = {
  name: 'generateInstructions',
  prompt: MEAL_INSTRUCTIONS_PROMPT,
  schema: MEAL_INSTRUCTIONS_SCHEMA,

  async execute(
    model: string,
    context: StepContext<MealResult>,
    runtime: StepRuntime,
  ): Promise<StepResult<MealResult, 'generateInstructions'>> {
    const { abortSignal } = runtime;
    const name = context.previousResults?.name ?? '';
    const ingredients = context.previousResults?.ingredients ?? [];
    const ingredientNames = (ingredients as Array<{ name: string }>)
      .map((i) => i.name)
      .join(', ');

    if (abortSignal?.aborted) {
      return { stepName: 'generateInstructions', data: {}, cancelled: true };
    }

    const response = await ollamaClient.chat({
      model,
      messages: [
        { role: 'system', content: MEAL_INSTRUCTIONS_PROMPT },
        {
          role: 'user',
          content: `Meal name: ${name}\nIngredients: ${ingredientNames}`,
        },
      ],
      stream: false,
      format: MEAL_INSTRUCTIONS_SCHEMA,
    });

    if (abortSignal?.aborted) {
      return { stepName: 'generateInstructions', data: {}, cancelled: true };
    }

    const parsed = JSON.parse(response.message.content);
    const instructions: string[] = Array.isArray(parsed.steps) ? parsed.steps : [];

    return { stepName: 'generateInstructions', data: { instructions } };
  },
};

export const createMealAction = {
  type: 'createMeal',
  description: 'Create a new meal recipe with ingredients and instructions',
  isMultiStep: true,

  steps: [
    proposeNameStep,
    generateBasicInfoStep,
    generateDescriptionStep,
    generateIngredientsStep,
    generateInstructionsStep,
  ],

  onStart(context, runtime) {
    const { chatId, messageId } = context;
    runtime.dispatch(
      updateMessageContent({
        chatId,
        messageId,
        content: '🍳 Generating recipe...',
        agentAction: {
          type: 'create_meal',
          status: 'generating',
          proposedName: '',
          meals: [],
        },
      }),
    );
  },

  onComplete(context, runtime, result) {
    const { chatId, messageId } = context;

    const prepTime = Math.floor((result.totalTime ?? 30) * 0.4);
    const cookTime = Math.ceil((result.totalTime ?? 30) * 0.6);

    const meal: AgentMealProposal = {
      title: result.name ?? '',
      description: result.description ?? '',
      category: result.category ?? 'dinner',
      prepTime,
      cookTime,
      servingSize: result.servings ?? 4,
      imageUrl: '',
      ingredients: (result.ingredients ?? []).map((ing) => ({
        name: ing.name,
        type: ing.type,
        unit: ing.unit,
        servings: ing.servings,
      })),
      instructions: result.instructions ?? [],
    };

    runtime.dispatch(
      updateAgentActionStatus({
        chatId,
        messageId,
        status: 'pending_approval',
        meals: [meal],
      }),
    );
  },

  onCancel(context, runtime, completedSteps) {
    const { chatId, messageId } = context;
    console.log(`Recipe generation cancelled after: ${completedSteps.join(', ')}`);
    runtime.dispatch(
      updateMessageContent({
        chatId,
        messageId,
        content: '❌ Recipe generation was cancelled.',
      }),
    );
  },

  getUpdatedMessageContentFromResult(result) {
    const name = result.name ?? 'your recipe';
    const content = `I've generated a recipe for **${name}**. Review it below and save it to your collection!`;
    return { content };
  },
} satisfies ActionHandler<MealResult, MealStepName>;
