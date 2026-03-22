import type { RecipeCategory } from '@lib/recipes';
import type { IngredientType, MeasurementUnit } from '@lib/ingredients';
import { store } from '@store/index';
import { ollamaClient } from '../ollama.service';
import {
  RECIPE_ITERATION_VALIDATION_PROMPT,
  RECIPE_ITERATION_SUMMARY_PROMPT,
  buildFieldDetectionPrompt,
} from '../prompts/recipe.prompts';
import {
  RECIPE_FIELD_DETECTION_SCHEMA,
  RECIPE_ITERATION_VALIDATION_SCHEMA,
  RECIPE_ITERATION_SUMMARY_SCHEMA,
} from '../schemas/recipe.schemas';
import type {
  ActionHandler,
  ActionStep,
  ActionContext,
  ActionRuntime,
  MultiStepActionResult,
  MultiStepActionRuntime,
  StepResult,
} from './types';
import type {
  AgentRecipeProposal,
  AgentIngredientProposal,
  RecipeIterableField,
} from '../action-types/createRecipeAction.types';
import {
  proposeNameStep,
  generateBasicInfoStep,
  generateDescriptionStep,
  generateIngredientsStep,
  generateInstructionsStep,
  formatContextMessages,
} from './createRecipeAction';
import type { RecipeResult, RecipeStepName } from './createRecipeAction';

/** Detection step names — one per iterable field, in evaluation order. */
export type FieldDetectStepName =
  | 'detectNameUpdate'
  | 'detectInfoUpdate'
  | 'detectDescriptionUpdate'
  | 'detectIngredientsUpdate'
  | 'detectInstructionsUpdate';

export type RecipeIterationStepName =
  | 'validateIterationRequest'
  | 'detectFieldsToUpdate'
  | 'summarizeIteration'
  | RecipeStepName;

export interface RecipeIterationResult extends Record<string, unknown> {
  iterationValid: boolean;
  agentMessage: string;
  fieldsToUpdate: RecipeIterableField[];
  /** Reasons why each field was selected for update — keyed by field name. */
  fieldReasons: Partial<Record<RecipeIterableField, string>>;
  existingProposal: AgentRecipeProposal;
  name: string;
  category: RecipeCategory;
  servings: number;
  totalTime: number;
  description: string;
  ingredients: Array<{
    name: string;
    type: IngredientType;
    unit: MeasurementUnit;
    servings: number;
  }>;
  instructions: string[];
  proposal: AgentRecipeProposal;
  /** LLM-generated 1-sentence summary of what was changed, shown to the user and
   * stored as the message's summary field for inclusion in future iteration context. */
  iterationSummary: string;
}

/** Ordered list of fields to evaluate — order matters because later steps see earlier decisions. */
const FIELD_DETECTION_ORDER: RecipeIterableField[] = [
  'name',
  'info',
  'description',
  'ingredients',
  'instructions',
];

/**
 * Returns `existing` when the field is not being updated, `undefined` when it is.
 * Used when pre-populating `accumulatedResult` before the generation loop so that:
 * - Steps for unchanged fields still receive the correct existing values as context.
 * - Steps for fields being updated start fresh (no stale value to short-circuit on).
 */
function keepIfUnchanged<T>(field: RecipeIterableField, existing: T, fieldsToUpdate: RecipeIterableField[]): T | undefined {
  return fieldsToUpdate.includes(field) ? undefined : existing;
}

const FIELD_TO_STEP: Array<{
  field: RecipeIterableField;
  step: ActionStep<RecipeResult, RecipeStepName>;
}> = [
  { field: 'name', step: proposeNameStep },
  { field: 'info', step: generateBasicInfoStep },
  { field: 'description', step: generateDescriptionStep },
  { field: 'ingredients', step: generateIngredientsStep },
  { field: 'instructions', step: generateInstructionsStep },
];

function formatProposalForPrompt(proposal: AgentRecipeProposal): string {
  const ingredientsList = proposal.ingredients
    .map((i) => `  - ${i.name} (${i.servings} ${i.unit})`)
    .join('\n');
  const totalTime = proposal.prepTime + proposal.cookTime;
  const instructionsList = proposal.instructions.map(i => `  - ${i}`).join('\n');

  return [
    `Title: ${proposal.title}`,
    `Category: ${proposal.category}`,
    `Servings: ${proposal.servingSize}`,
    `Total time: ${totalTime} min (prep ${proposal.prepTime}m, cook ${proposal.cookTime}m)`,
    `Description: ${proposal.description}`,
    `Ingredients:\n${ingredientsList}`,
    `Instructions:\n${instructionsList}`,
  ].join('\n');
}

function formatFieldForPrompt(
  proposal: AgentRecipeProposal,
  field: RecipeIterableField,
): string {
  if (field === 'name') {
    return proposal.title;
  }

  if (field === 'description') {
    return proposal.description;
  }

  if (field === 'info') {
    const totalTime = proposal.prepTime + proposal.cookTime;

    return [
      `Category: ${proposal.category}`,
      `Servings: ${proposal.servingSize}`,
      `Total time: ${totalTime} min (prep ${proposal.prepTime}m, cook ${proposal.cookTime}m)`,
    ].join('\n');
  }

  if (field === 'ingredients') {
    const ingredientsList = proposal.ingredients
      .map((i) => `  - ${i.name} (${i.servings} ${i.unit})`)
      .join('\n');
    return ingredientsList;
  }

  if (field === 'instructions') {
    const instructionsList = proposal.instructions
    .map(i => `  - ${i}`)
    .
    join('\n');
    return instructionsList;
  }

  return '';
}

function formatPriorDecisions(
  decisions: Array<{
    field: RecipeIterableField;
    shouldUpdate: boolean;
    reason: string;
  }>,
): string {
  return decisions
    .filter((dec) => dec.shouldUpdate)
    .map(({ field, reason }) => {
      return `- ${field}: NEEDS UPDATE — ${reason}`;
    })
    .join('\n');
}

/**
 * Runs 5 sequential per-field LLM calls (name → info → description → ingredients → instructions).
 * Each call is focused on one field only and receives all prior field decisions as context,
 * enabling cascading reasoning (e.g. "ingredients changed → instructions must be re-checked").
 * Returns { fieldsToUpdate } — the subset of fields where shouldUpdate was true.
 *
 * Can be invoked in isolation via iterateRecipeAction.executeStep('detectFieldsToUpdate', ...).
 */
export const detectFieldsToUpdateStep: ActionStep<
  RecipeIterationResult,
  'detectFieldsToUpdate'
> = {
  name: 'detectFieldsToUpdate',

  async execute(
    model: string,
    context: ActionContext<RecipeIterationResult>,
    runtime: ActionRuntime,
  ): Promise<StepResult<RecipeIterationResult, 'detectFieldsToUpdate'>> {
    const { abortSignal } = runtime;
    const existingProposal = context.previousResults?.existingProposal;

    if (!existingProposal) {
      return { stepName: 'detectFieldsToUpdate', data: { fieldsToUpdate: [], fieldReasons: {} } };
    }

    if (abortSignal?.aborted) {
      return {
        stepName: 'detectFieldsToUpdate',
        data: { fieldsToUpdate: [], fieldReasons: {} },
        cancelled: true,
      };
    }

    const priorDecisions: Array<{
      field: RecipeIterableField;
      shouldUpdate: boolean;
      reason: string;
    }> = [];

    for (const field of FIELD_DETECTION_ORDER) {
      if (abortSignal?.aborted) {
        return {
          stepName: 'detectFieldsToUpdate',
          data: { fieldsToUpdate: [], fieldReasons: {} },
          cancelled: true,
        };
      }

      const priorDecisionsText = formatPriorDecisions(priorDecisions);
      const fieldForPrompt = formatFieldForPrompt(existingProposal, field);
      const systemContent = `${buildFieldDetectionPrompt(field, priorDecisionsText)}\n\nCurrent ${field}:\n${fieldForPrompt}`;

      const response = await ollamaClient.chat({
        model,
        messages: [
          { role: 'system', content: systemContent },
          ...formatContextMessages(context.messages),
        ],
        stream: false,
        format: RECIPE_FIELD_DETECTION_SCHEMA,
      });

      if (abortSignal?.aborted) {
        return {
          stepName: 'detectFieldsToUpdate',
          data: { fieldsToUpdate: [], fieldReasons: {} },
          cancelled: true,
        };
      }

      const parsed = JSON.parse(response.message.content);
      const shouldUpdate: boolean = parsed.shouldUpdate === true;
      const reason: string = parsed.reason ?? '';

      priorDecisions.push({ field, shouldUpdate, reason });
    }

    const fieldsToUpdate: RecipeIterableField[] = priorDecisions
      .filter((d) => d.shouldUpdate)
      .map((d) => d.field);

    const fieldReasons: Partial<Record<RecipeIterableField, string>> = {};
    for (const { field, shouldUpdate, reason } of priorDecisions) {
      if (shouldUpdate) {
        fieldReasons[field] = reason;
      }
    }

    return { stepName: 'detectFieldsToUpdate', data: { fieldsToUpdate, fieldReasons } };
  },
};

export const validateIterationRequestStep: ActionStep<
  RecipeIterationResult,
  'validateIterationRequest'
> = {
  name: 'validateIterationRequest',

  async execute(
    model: string,
    context: ActionContext<RecipeIterationResult>,
    runtime: ActionRuntime,
  ): Promise<StepResult<RecipeIterationResult, 'validateIterationRequest'>> {
    const { abortSignal } = runtime;
    const existingProposal = context.previousResults?.existingProposal;

    if (!existingProposal) {
      return {
        stepName: 'validateIterationRequest',
        data: {
          iterationValid: false,
          agentMessage:
            "I couldn't find a recipe to refine. Please start a new recipe creation.",
        },
      };
    }

    if (abortSignal?.aborted) {
      // agentMessage is intentionally empty — cancelled results are never shown to the user.
      return {
        stepName: 'validateIterationRequest',
        data: { iterationValid: false, agentMessage: '' },
        cancelled: true,
      };
    }

    const proposalSummary = formatProposalForPrompt(existingProposal);

    // Validation only inspects the single latest user message — we don't want prior
    // conversation context to influence whether this particular message is valid.
    const lastMessage = context.messages[context.messages.length - 1];
    const lastUserContent =
      lastMessage?.rawContent ?? lastMessage?.content ?? '';

    const response = await ollamaClient.chat({
      model,
      messages: [
        {
          role: 'system',
          content: `${RECIPE_ITERATION_VALIDATION_PROMPT}\n\nCurrent recipe:\n${proposalSummary}`,
        },
        { role: 'user', content: lastUserContent },
      ],
      stream: false,
      format: RECIPE_ITERATION_VALIDATION_SCHEMA,
    });

    if (abortSignal?.aborted) {
      return {
        stepName: 'validateIterationRequest',
        data: { iterationValid: false, agentMessage: '' },
        cancelled: true,
      };
    }

    const parsed = JSON.parse(response.message.content);
    const iterationValid: boolean = parsed.valid === true;
    const agentMessage: string = parsed.agentMessage ?? '';

    return {
      stepName: 'validateIterationRequest',
      data: { iterationValid, agentMessage },
    };
  },
};

/**
 * Generates a brief, friendly summary of what was changed during this iteration.
 * The summary is shown to the user as the assistant message and also stored as the
 * message's `summary` field so it's included in future iteration context automatically.
 */
export const summarizeIterationStep: ActionStep<RecipeIterationResult, 'summarizeIteration'> = {
  name: 'summarizeIteration',

  async execute(
    model: string,
    context: ActionContext<RecipeIterationResult>,
    runtime: ActionRuntime,
  ): Promise<StepResult<RecipeIterationResult, 'summarizeIteration'>> {
    const { abortSignal } = runtime;

    const fieldsToUpdate = (context.previousResults?.fieldsToUpdate as RecipeIterableField[]) ?? [];
    const fieldReasons = (context.previousResults?.fieldReasons as Partial<Record<RecipeIterableField, string>>) ?? {};
    const existingProposal = context.previousResults?.existingProposal as AgentRecipeProposal | undefined;
    const updatedName = context.previousResults?.name as string | undefined;
    const recipeName = updatedName ?? existingProposal?.title;

    if (abortSignal?.aborted) {
      return { stepName: 'summarizeIteration', data: { iterationSummary: '' }, cancelled: true };
    }

    const changeLines = fieldsToUpdate
      .map((field) => {
        const reason = fieldReasons[field] ?? `${field} updated`;
        return `- ${field}: ${reason}`;
      })
      .join('\n');

    const userContent = recipeName
      ? `Recipe: "${recipeName}"\nChanges made:\n${changeLines}`
      : `Changes made:\n${changeLines}`;

    const response = await ollamaClient.chat({
      model,
      messages: [
        { role: 'system', content: RECIPE_ITERATION_SUMMARY_PROMPT },
        { role: 'user', content: userContent },
      ],
      stream: false,
      format: RECIPE_ITERATION_SUMMARY_SCHEMA,
    });

    if (abortSignal?.aborted) {
      return { stepName: 'summarizeIteration', data: { iterationSummary: '' }, cancelled: true };
    }

    const parsed = JSON.parse(response.message.content);
    const iterationSummary: string = parsed.summary ?? '';

    return { stepName: 'summarizeIteration', data: { iterationSummary } };
  },
};

export const iterateRecipeAction = {
  type: 'iterateRecipe' as const,
  description:
    'Refine an existing recipe proposal by regenerating only the fields that need to change',
  isMultiStep: true,

  steps: [validateIterationRequestStep, detectFieldsToUpdateStep, summarizeIterationStep],

  async executeStep(
    model: string,
    stepName: RecipeIterationStepName,
    context: ActionContext<RecipeIterationResult>,
    runtime: ActionRuntime,
  ): Promise<StepResult<RecipeIterationResult, RecipeIterationStepName>> {
    if (stepName === 'validateIterationRequest') {
      return validateIterationRequestStep.execute(model, context, runtime);
    }
    if (stepName === 'detectFieldsToUpdate') {
      return detectFieldsToUpdateStep.execute(model, context, runtime);
    }
    if (stepName === 'summarizeIteration') {
      return summarizeIterationStep.execute(model, context, runtime);
    }
    const entry = FIELD_TO_STEP.find((e) => e.step.name === stepName);
    if (!entry) {
      throw new Error(`Unknown iteration step: ${stepName}`);
    }
    const result = await entry.step.execute(
      model,
      context as unknown as ActionContext<RecipeResult>,
      runtime,
    );
    return result as StepResult<RecipeIterationResult, RecipeIterationStepName>;
  },

  async execute(
    model: string,
    context: ActionContext<RecipeIterationResult>,
    runtime: MultiStepActionRuntime,
  ): Promise<
    MultiStepActionResult<RecipeIterationResult, RecipeIterationStepName>
  > {
    const completedSteps: RecipeIterationStepName[] = [];
    const existingProposal = context.previousResults?.existingProposal;

    if (!existingProposal) {
      return { data: {}, completedSteps, cancelled: true };
    }

    // Step 1: Validate that the user's message is actually about refining the recipe.
    const validationResult = await validateIterationRequestStep.execute(
      model,
      context,
      runtime,
    );

    if (validationResult.cancelled) {
      return { data: {}, completedSteps, cancelled: true };
    }

    const iterationValid = validationResult.data.iterationValid as boolean;
    const agentMessage = (validationResult.data.agentMessage as string) ?? '';
    completedSteps.push('validateIterationRequest');

    // Notify consumer immediately with the agent's acknowledgment or refusal.
    runtime.onStepComplete?.('validateIterationRequest', {
      iterationValid,
      agentMessage,
    });

    if (!iterationValid) {
      // Not a valid refinement request — communicate this to the consumer and stop.
      return {
        data: { iterationValid, agentMessage, existingProposal },
        completedSteps,
        cancelled: false,
      };
    }

    // Step 2: Detect which fields need updating via 5 sequential per-field LLM calls.
    const fieldResult = await detectFieldsToUpdateStep.execute(
      model,
      context,
      runtime,
    );

    if (fieldResult.cancelled) {
      return {
        data: { iterationValid, agentMessage },
        completedSteps,
        cancelled: true,
      };
    }

    const fieldsToUpdate: RecipeIterableField[] =
      (fieldResult.data.fieldsToUpdate as RecipeIterableField[]) ?? [];
    const fieldReasons: Partial<Record<RecipeIterableField, string>> =
      (fieldResult.data.fieldReasons as Partial<Record<RecipeIterableField, string>>) ?? {};
    completedSteps.push('detectFieldsToUpdate');

    // Notify consumer so it can show per-field loading skeletons.
    runtime.onStepComplete?.('detectFieldsToUpdate', { fieldsToUpdate });

    if (fieldsToUpdate.length === 0 || runtime.abortSignal?.aborted) {
      return {
        data: {
          iterationValid,
          agentMessage,
          fieldsToUpdate,
          fieldReasons,
          existingProposal,
        },
        completedSteps,
        cancelled: false,
      };
    }

    // Pre-populate accumulated result from the existing proposal for fields that are NOT
    // being regenerated — do NOT pre-populate fields that are in fieldsToUpdate, otherwise
    // generation steps that have early-return guards (e.g. proposeNameStep checks for an
    // existing name) would skip regeneration entirely.
    const accumulatedResult: Partial<RecipeIterationResult> = {
      iterationValid,
      agentMessage,
      fieldsToUpdate,
      fieldReasons,
      existingProposal,
      name: keepIfUnchanged('name', existingProposal.title, fieldsToUpdate),
      category: keepIfUnchanged('info', existingProposal.category, fieldsToUpdate),
      servings: keepIfUnchanged('info', existingProposal.servingSize, fieldsToUpdate),
      totalTime: keepIfUnchanged('info', existingProposal.prepTime + existingProposal.cookTime, fieldsToUpdate),
      description: keepIfUnchanged('description', existingProposal.description, fieldsToUpdate),
      ingredients: keepIfUnchanged(
        'ingredients',
        existingProposal.ingredients.map((ing) => ({
          name: ing.name,
          type: ing.type,
          unit: ing.unit,
          servings: ing.servings,
        })),
        fieldsToUpdate,
      ),
      instructions: keepIfUnchanged('instructions', existingProposal.instructions, fieldsToUpdate),
    };

    const stepsToRun = FIELD_TO_STEP.filter(({ field }) =>
      fieldsToUpdate.includes(field),
    );

    for (const { field, step } of stepsToRun) {
      if (runtime.abortSignal?.aborted) break;

      // Pass the field-specific detection reason as additionalContext so the LLM knows
      // precisely what to change, rather than relying solely on the conversation text.
      const stepContext: ActionContext<RecipeResult> = {
        messages: context.messages,
        previousResults: {
          ...(accumulatedResult as Partial<RecipeResult>),
          additionalContext: fieldReasons[field] ?? '',
        },
      };

      const stepResult = await step.execute(model, stepContext, runtime);

      if (stepResult.cancelled) break;

      Object.assign(accumulatedResult, stepResult.data);
      completedSteps.push(step.name as RecipeIterationStepName);

      // Notify consumer about the completed step so the UI can update only the changed field.
      if (runtime.onStepComplete) {
        if (
          field === 'ingredients' &&
          Array.isArray(stepResult.data.ingredients)
        ) {
          const existingIngredients = store.getState().ingredients.items;
          const proposals: AgentIngredientProposal[] = (
            stepResult.data.ingredients as Array<Record<string, unknown>>
          ).map((ing) => {
            const match = existingIngredients.find(
              (e) =>
                e.name.toLowerCase() === String(ing.name ?? '').toLowerCase(),
            );
            return {
              name: String(ing.name ?? ''),
              type: ing.type as IngredientType,
              unit: ing.unit as MeasurementUnit,
              servings: Number(ing.servings) || 0,
              isNew: match === undefined,
              existingIngredientId: match?.id ?? null,
            };
          });
          runtime.onStepComplete(field, { ingredients: proposals });
        } else {
          runtime.onStepComplete(
            field,
            stepResult.data as Record<string, unknown>,
          );
        }
      }
    }

    const generationStepsCompleted = completedSteps.filter(
      (s) => s !== 'validateIterationRequest' && s !== 'detectFieldsToUpdate',
    );
    const cancelled =
      (runtime.abortSignal?.aborted ?? false) ||
      generationStepsCompleted.length < stepsToRun.length;

    if (!cancelled) {
      const keepExistingTime = !fieldsToUpdate.includes('info');
      const prepTime = keepExistingTime
        ? existingProposal.prepTime
        : Math.floor((accumulatedResult.totalTime ?? 30) * 0.4);
      const cookTime = keepExistingTime
        ? existingProposal.cookTime
        : Math.ceil((accumulatedResult.totalTime ?? 30) * 0.6);

      const existingIngredients = store.getState().ingredients.items;

      const proposal: AgentRecipeProposal = {
        title: accumulatedResult.name ?? existingProposal.title,
        description:
          accumulatedResult.description ?? existingProposal.description,
        category: accumulatedResult.category ?? existingProposal.category,
        prepTime,
        cookTime,
        servingSize: accumulatedResult.servings ?? existingProposal.servingSize,
        imageUrl: existingProposal.imageUrl,
        instructions:
          accumulatedResult.instructions ?? existingProposal.instructions,
        ingredients: fieldsToUpdate.includes('ingredients')
          ? (accumulatedResult.ingredients ?? []).map((ing) => {
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
            })
          : existingProposal.ingredients,
      };

      accumulatedResult.proposal = proposal;

      // Step 3: Generate a concise LLM summary of what was changed.
      // This is shown to the user and stored as the message's summary so future
      // iterations know what was previously modified.
      const summaryContext: ActionContext<RecipeIterationResult> = {
        messages: context.messages,
        previousResults: accumulatedResult,
      };

      const summaryResult = await summarizeIterationStep.execute(
        model,
        summaryContext,
        runtime,
      );

      if (!summaryResult.cancelled) {
        const iterationSummary = (summaryResult.data.iterationSummary as string) ?? '';
        accumulatedResult.iterationSummary = iterationSummary;
        completedSteps.push('summarizeIteration');
      }
    }

    return { data: accumulatedResult, completedSteps, cancelled };
  },
} satisfies ActionHandler<RecipeIterationResult, RecipeIterationStepName>;
