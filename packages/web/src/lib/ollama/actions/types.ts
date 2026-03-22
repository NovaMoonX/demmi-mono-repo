import type { ChatMessage } from '@lib/chat';
import { AgentAction } from '../action-types';

export type ActionType = 'general' | 'createMeal';

// Pure data context for LLM calls — no store references, no chatId/messageId.
export interface ActionContext<ResultType extends Record<string, unknown>> {
  messages: ChatMessage[];
  previousResults?: Partial<ResultType>;
}

// Base runtime — operational concerns only, no dispatch.
export interface ActionRuntime {
  abortSignal?: AbortSignal;
  // For streaming single-step handlers: called with partial display content as it arrives.
  onProgress?: (content: string) => void;
}

// Extended runtime for multi-step handlers — adds a per-step completion callback.
export interface MultiStepActionRuntime extends ActionRuntime {
  // Called after each step completes. `key` identifies the step (defined by the handler),
  // `data` is the partial result data for that step. The consumer uses this to update state.
  onStepComplete?: (key: string, data: Record<string, unknown>) => void;
}

export interface StepResult<
  ResultType extends Record<string, unknown>,
  Name extends string,
> {
  stepName: Name;
  data: Partial<ResultType>;
  cancelled?: boolean;
}

// An individual step in a multi-step pipeline — pure LLM interaction, no state updates.
// Steps can also be called independently outside the pipeline.
export interface ActionStep<
  ResultType extends Record<string, unknown>,
  Name extends string,
> {
  name: Name;
  execute: (
    model: string,
    context: ActionContext<ResultType>,
    runtime: ActionRuntime,
  ) => Promise<StepResult<ResultType, Name>>;
}

export const MULTI_STEP_ACTION_HANDLER_ERROR =
  'MultiStepActionHandler requires ValidStepNames';

type RequireStepNames<T extends string> = [T] extends [never]
  ? typeof MULTI_STEP_ACTION_HANDLER_ERROR
  : T;

// Utility type to extract the ResultType and ValidStepNames from an ActionHandler.
export type ExtractActionHandler<T> =
  T extends ActionHandler<infer ResultType, infer ValidStepNames>
    ? { result: ResultType; stepNames: ValidStepNames }
    : never;

// Result from a single-step handler. `cancelled` is optional — most single-step actions
// complete fully; only streaming actions that are aborted mid-flight set this to true.
export interface ActionResult<ResultType extends Record<string, unknown>> {
  data: ResultType;
  cancelled?: boolean;
}

// Result from a multi-step handler. `cancelled` is always present (required) because the
// consumer must always check it to decide whether to transition state or roll back.
export interface MultiStepActionResult<
  ResultType extends Record<string, unknown>,
  ValidStepNames extends string,
> {
  data: Partial<ResultType>;
  completedSteps: ValidStepNames[];
  cancelled: boolean;
}

interface SingleStepActionHandler<ResultType extends Record<string, unknown>> {
  type: string;
  description: string;
  isMultiStep: false;

  execute: (
    model: string,
    context: ActionContext<ResultType>,
    runtime: ActionRuntime,
  ) => Promise<ActionResult<ResultType>>;

  getUpdatedMessageContentFromResult: (result: ResultType) => {
    content: string;
    rawContent?: string | null;
    agentAction?: AgentAction | null;
  };
}

interface MultiStepActionHandler<
  ResultType extends Record<string, unknown>,
  ValidStepNames extends string,
> {
  type: string;
  description: string;
  isMultiStep: true;

  // Individual steps — exposed so they can also be called independently outside the pipeline.
  steps: ActionStep<ResultType, RequireStepNames<ValidStepNames>>[];

  // Single entry-point: runs all steps internally. The consumer receives progress via callbacks
  // on the runtime and handles all state updates; the handler performs no dispatch itself.
  execute: (
    model: string,
    context: ActionContext<ResultType>,
    runtime: MultiStepActionRuntime,
  ) => Promise<MultiStepActionResult<ResultType, ValidStepNames>>;

  // Execute a specific step independently (outside the full pipeline).
  executeStep: (
    model: string,
    stepName: RequireStepNames<ValidStepNames>,
    context: ActionContext<ResultType>,
    runtime: ActionRuntime,
  ) => Promise<StepResult<ResultType, RequireStepNames<ValidStepNames>>>;

  getUpdatedMessageContentFromResult?: (result: Partial<ResultType>) => {
    content: string;
    rawContent?: string | null;
  };
}

export type ActionHandler<
  ResultType extends Record<string, unknown> = never,
  ValidStepNames extends string = never,
> =
  | SingleStepActionHandler<ResultType>
  | MultiStepActionHandler<ResultType, ValidStepNames>;
