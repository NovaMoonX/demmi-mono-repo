import type { MealCategory } from '@lib/meals';
import type { IngredientType, MeasurementUnit } from '@lib/ingredients';
import { store } from '@store/index';
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
import type {
  ActionHandler,
  ActionStep,
  ActionContext,
  ActionRuntime,
  MultiStepActionResult,
  MultiStepActionRuntime,
  StepResult,
} from './types';
import type { AgentMealProposal, RecipeStep } from '../action-types/createMealAction.types';
import type { ChatMessage } from '@lib/chat';

const MAX_CONTEXT_MESSAGES = 3;

/** Maps the most recent chat messages to the format expected by the Ollama client. */
export function formatContextMessages(messages: ChatMessage[], limit = MAX_CONTEXT_MESSAGES) {
  return messages.slice(-limit).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.rawContent ?? m.content,
  }));
}

/**
 * Appends `additionalContext` (the field-specific reason from detectFieldsToUpdateStep)
 * to the base user content string. When iterating on a meal, each generation step
 * receives the reason why its field needs updating, giving the LLM precise guidance.
 */
function withContext(baseContent: string, additionalContext?: string): string {
  return additionalContext ? `${baseContent}\nChange context: ${additionalContext}` : baseContent;
}

export interface MealResult extends Record<string, unknown> {
  name: string;
  category: MealCategory;
  servings: number;
  totalTime: number;
  description: string;
  ingredients: Array<{ name: string; type: IngredientType; unit: MeasurementUnit; servings: number }>;
  instructions: string[];
  // Built after all steps complete — the final proposal ready for the consumer to save.
  proposal: AgentMealProposal;
  /** Optional guidance passed by the iterate flow — a reason from detectFieldsToUpdateStep
   * describing exactly what to change for this field. When set, generation steps append it
   * to the user content so the LLM knows precisely what to regenerate. */
  additionalContext: string;
}

export type MealStepName =
  | 'proposeName'
  | 'generateBasicInfo'
  | 'generateDescription'
  | 'generateIngredients'
  | 'generateInstructions';

// Maps each MealStepName to the RecipeStep key used by the consumer for state updates.
// Typed as `Record<MealStepName, RecipeStep>` so the values are validated at compile time.
const STEP_RECIPE_KEY: Record<MealStepName, RecipeStep> = {
  proposeName: 'name',
  generateBasicInfo: 'info',
  generateDescription: 'description',
  generateIngredients: 'ingredients',
  generateInstructions: 'instructions',
};

// Each step is exported so it can also be invoked independently outside the pipeline.

export const proposeNameStep: ActionStep<MealResult, 'proposeName'> = {
  name: 'proposeName',

  async execute(
    model: string,
    context: ActionContext<MealResult>,
    runtime: ActionRuntime,
  ): Promise<StepResult<MealResult, 'proposeName'>> {
    const { messages } = context;
    const { abortSignal } = runtime;

    // If a name was already agreed upon (e.g. from the confirmation step), reuse it directly
    // so we don't regenerate a different — potentially longer — name during the pipeline.
    const existingName = context.previousResults?.name;
    if (existingName) {
      return { stepName: 'proposeName', data: { name: existingName } };
    }

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
        ...(context.previousResults?.additionalContext
          ? [{ role: 'user' as const, content: `Change context: ${context.previousResults.additionalContext}` }]
          : []),
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

export const generateBasicInfoStep: ActionStep<MealResult, 'generateBasicInfo'> = {
  name: 'generateBasicInfo',

  async execute(
    model: string,
    context: ActionContext<MealResult>,
    runtime: ActionRuntime,
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
        {
          role: 'user',
          content: withContext(`Meal name: ${name}`, context.previousResults?.additionalContext as string | undefined),
        },
        ...formatContextMessages(context.messages),
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

export const generateDescriptionStep: ActionStep<MealResult, 'generateDescription'> = {
  name: 'generateDescription',

  async execute(
    model: string,
    context: ActionContext<MealResult>,
    runtime: ActionRuntime,
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
        {
          role: 'user',
          content: withContext(`Meal name: ${name}`, context.previousResults?.additionalContext as string | undefined),
        },
        ...formatContextMessages(context.messages),
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

export const generateIngredientsStep: ActionStep<MealResult, 'generateIngredients'> = {
  name: 'generateIngredients',

  async execute(
    model: string,
    context: ActionContext<MealResult>,
    runtime: ActionRuntime,
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
        {
          role: 'user',
          content: withContext(`Meal name: ${name}\nServings: ${servings}`, context.previousResults?.additionalContext as string | undefined),
        },
        ...formatContextMessages(context.messages),
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

export const generateInstructionsStep: ActionStep<MealResult, 'generateInstructions'> = {
  name: 'generateInstructions',

  async execute(
    model: string,
    context: ActionContext<MealResult>,
    runtime: ActionRuntime,
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
          content: withContext(`Meal name: ${name}\nIngredients: ${ingredientNames}`, context.previousResults?.additionalContext as string | undefined),
        },
        ...formatContextMessages(context.messages),
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

const steps = [
  proposeNameStep,
  generateBasicInfoStep,
  generateDescriptionStep,
  generateIngredientsStep,
  generateInstructionsStep,
];

export const createMealAction = {
  type: 'createMeal',
  description: 'Create a new meal recipe with ingredients and instructions',
  isMultiStep: true,

  steps,

  async executeStep(
    model: string,
    stepName: MealStepName,
    context: ActionContext<MealResult>,
    runtime: ActionRuntime,
  ): Promise<StepResult<MealResult, MealStepName>> {
    const step = steps.find((candidateStep) => candidateStep.name === stepName);

    if (!step) {
      throw new Error(`Unknown meal action step: ${stepName}`);
    }

    const stepResult = await step.execute(model, context, runtime);
    const result: StepResult<MealResult, MealStepName> = {
      stepName: stepResult.stepName,
      data: stepResult.data,
      cancelled: stepResult.cancelled,
    };

    return result;
  },

  async execute(
    model: string,
    context: ActionContext<MealResult>,
    runtime: MultiStepActionRuntime,
  ): Promise<MultiStepActionResult<MealResult, MealStepName>> {
    const completedSteps: MealStepName[] = [];
    const accumulatedResult: Partial<MealResult> = {};

    for (const step of steps) {
      if (runtime.abortSignal?.aborted) break;

      const stepContext: ActionContext<MealResult> = {
        ...context,
        previousResults: accumulatedResult,
      };

      const stepResult = await step.execute(model, stepContext, runtime);

      if (stepResult.cancelled) break;

      Object.assign(accumulatedResult, stepResult.data);
      completedSteps.push(step.name as MealStepName);

      // Notify the consumer with the recipe step key and display-ready data.
      // The consumer is responsible for updating state (e.g. dispatching updateRecipeStep).
      const recipeKey = STEP_RECIPE_KEY[step.name as MealStepName];
      if (recipeKey && runtime.onStepComplete) {
        if (step.name === 'generateIngredients' && Array.isArray(stepResult.data.ingredients)) {
          // Transform raw LLM ingredient format into the display format.
          const rawIngredients = stepResult.data.ingredients as Array<Record<string, unknown>>;
          const displayIngredients = rawIngredients.map((i) => ({
            name: String(i.name ?? ''),
            amount: `${i.servings ?? ''} ${i.unit ?? ''}`.trim(),
          }));
          runtime.onStepComplete(recipeKey, { ingredients: displayIngredients });
        } else {
          runtime.onStepComplete(recipeKey, stepResult.data as Record<string, unknown>);
        }
      }
    }

    const cancelled = (runtime.abortSignal?.aborted ?? false) || completedSteps.length < steps.length;

    if (!cancelled) {
      const prepTime = Math.floor((accumulatedResult.totalTime ?? 30) * 0.4);
      const cookTime = Math.ceil((accumulatedResult.totalTime ?? 30) * 0.6);

      const existingIngredients = store.getState().ingredients.items;

      const proposal: AgentMealProposal = {
        title: accumulatedResult.name ?? '',
        description: accumulatedResult.description ?? '',
        category: accumulatedResult.category ?? 'dinner',
        prepTime,
        cookTime,
        servingSize: accumulatedResult.servings ?? 4,
        imageUrl: '',
        ingredients: (accumulatedResult.ingredients ?? []).map((ing) => {
          const match = existingIngredients.find(
            (e) => e.name.toLowerCase() === ing.name.toLowerCase(),
          );
          return {
            name: ing.name,
            type: ing.type,
            unit: ing.unit,
            servings: ing.servings,
            isNew: match === undefined,
            existingIngredientId: match?.id ?? null,
          };
        }),
        instructions: accumulatedResult.instructions ?? [],
      };

      accumulatedResult.proposal = proposal;
    }

    return { data: accumulatedResult, completedSteps, cancelled };
  },

  getUpdatedMessageContentFromResult(result: Partial<MealResult>) {
    const name = result.name ?? 'your recipe';
    const content = `I've generated a recipe for **${name}**. Review it below and save it to your collection!`;
    return { content };
  },
} satisfies ActionHandler<MealResult, MealStepName>;
