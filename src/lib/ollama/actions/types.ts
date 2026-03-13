import type { ChatMessage } from '@lib/chat';
import type { AppDispatch } from '@store/index';

export type ActionType = 'general' | 'createMeal';

export interface StepContext<ResultType extends Record<string, unknown>> {
  messages: ChatMessage[];
  chatId: string;
  messageId: string;
  previousResults?: Partial<ResultType>;
}

export interface StepRuntime {
  dispatch: AppDispatch;
  abortSignal?: AbortSignal;
}

export interface StepResult<
  ResultType extends Record<string, unknown>,
  Name extends string,
> {
  stepName: Name;
  data: Partial<ResultType>;
  error?: string;
  cancelled?: boolean;
}

export interface ActionStep<
  ResultType extends Record<string, unknown>,
  Name extends string,
> {
  name: Name;
  prompt: string;
  schema: Record<string, unknown>;
  isStreaming?: boolean;
  execute: (
    model: string,
    context: StepContext<ResultType>,
    runtime: StepRuntime,
  ) => Promise<
    | StepResult<ResultType, Name>
    | AsyncIterableIterator<StepResult<ResultType, Name>>
  >;
  onCancel?: (context: StepContext<ResultType>, runtime: StepRuntime) => void;
}

// `ResultType` represents the shape of the data returned by the action handler upon completion.
interface ActionHandlerBase<ResultType extends Record<string, unknown>> {
  type: ActionType;
  description: string;

  onStart?: (context: StepContext<ResultType>, runtime: StepRuntime) => void;
  onComplete?: (
    context: StepContext<ResultType>,
    runtime: StepRuntime,
    result: ResultType,
  ) => void;
}

interface SingleStepActionHandler<
  ResultType extends Record<string, unknown>,
> extends ActionHandlerBase<ResultType> {
  isMultiStep: false;

  execute: (
    model: string,
    context: StepContext<ResultType>,
    runtime: StepRuntime,
  ) => Promise<
    ActionResult<ResultType> | AsyncIterableIterator<ActionResult<ResultType>>
  >;

  steps?: never;

  onCancel?: (context: StepContext<ResultType>, runtime: StepRuntime) => void;
}

// This type ensures that if `isMultiStep` is true and steps are provided
// then `ValidStepNames` must be provided to the action handler,
// where `ValidStepNames` is a union of string literals representing
// the valid step names for that handler.
type RequireStepNames<T extends string> = [T] extends [never]
  ? 'MultiStepActionHandler requires ValidStepNames'
  : T;

interface MultiStepActionHandler<
  ResultType extends Record<string, unknown>,
  ValidStepNames extends string,
> extends ActionHandlerBase<ResultType> {
  isMultiStep: true;

  execute?: never;

  steps: ActionStep<ResultType, RequireStepNames<ValidStepNames>>[];

  onCancel?: (
    context: StepContext<ResultType>,
    runtime: StepRuntime,
    completedSteps: RequireStepNames<ValidStepNames>[],
  ) => void;
}

export type ActionHandler<
  ResultType extends Record<string, unknown> = never,
  ValidStepNames extends string = never,
> =
  | SingleStepActionHandler<ResultType>
  // `ValidStepNames` should always be provided for multi-step handlers
  | MultiStepActionHandler<ResultType, ValidStepNames>;

export interface ActionResult<ResultType extends Record<string, unknown>> {
  type: ActionType;
  data: ResultType;
  error?: string;
}
