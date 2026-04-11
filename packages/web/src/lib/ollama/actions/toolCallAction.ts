import type {
  ActionContext,
  ActionRuntime,
  ActionHandler,
  ActionResult,
} from './types';
import type { AgentAction } from '../action-types';
import type { ToolCallResultInfo } from '../action-types/toolCallAction.types';
import { runToolCallLoop, buildToolCallMessages } from '../tools/toolCallLoop';
import { buildToolCallingSystemPrompt } from '../prompts/toolCalling.prompts';
import type { ToolContext } from '../tools/tool.types';
import type { RootState, AppDispatch } from '@store/index';

export interface ToolCallResult extends Record<string, unknown> {
  content: string;
  toolResults: ToolCallResultInfo[];
  hasPendingConfirmation: boolean;
}

export interface ToolCallRuntime extends ActionRuntime {
  getState: () => RootState;
  dispatch: AppDispatch;
  userId: string;
  onToolCallStart?: (toolCalls: ToolCallResultInfo[]) => void;
  onToolCallComplete?: (index: number, result: ToolCallResultInfo) => void;
}

export const toolCallAction: ActionHandler<ToolCallResult> = {
  type: 'toolCall',
  description: 'Tool-calling agent action for data operations',
  isMultiStep: false,

  execute: async (
    model: string,
    context: ActionContext<ToolCallResult>,
    runtime: ActionRuntime,
  ): Promise<ActionResult<ToolCallResult>> => {
    const toolRuntime = runtime as ToolCallRuntime;
    const state = toolRuntime.getState();
    const profile = state.userProfile.profile;
    const memories = state.memory.items;

    const profileSummary = profile
      ? [
        profile.displayName ? `Name: ${profile.displayName}` : null,
        profile.dietaryRestrictions.length > 0
          ? `Dietary restrictions: ${profile.dietaryRestrictions.join(', ')}`
          : null,
        profile.skillLevel ? `Skill level: ${profile.skillLevel}` : null,
        profile.householdSize ? `Household size: ${profile.householdSize}` : null,
        profile.cookTimePreference
          ? `Cook time preference: ${profile.cookTimePreference}`
          : null,
      ]
        .filter(Boolean)
        .join('\n')
      : undefined;

    const memoryTexts = memories.map((m) => m.content);

    const systemPrompt = buildToolCallingSystemPrompt(profileSummary, memoryTexts);

    const chatMessages = context.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const messages = buildToolCallMessages(systemPrompt, chatMessages);

    const toolContext: ToolContext = {
      getState: toolRuntime.getState,
      dispatch: toolRuntime.dispatch,
      userId: toolRuntime.userId,
    };

    const loopResult = await runToolCallLoop(model, messages, toolContext, {
      onToolCallStart: (calls) => {
        const toolCallInfos: ToolCallResultInfo[] = calls.map((tc) => ({
          toolName: tc.name,
          args: tc.arguments,
          status: 'executing',
          requiresConfirmation: false,
          result: null,
        }));
        toolRuntime.onToolCallStart?.(toolCallInfos);
      },
      onToolCallComplete: (index, executionResult) => {
        const info: ToolCallResultInfo = {
          toolName: executionResult.toolName,
          args: executionResult.args,
          status: executionResult.requiresConfirmation ? 'pending' : 'completed',
          requiresConfirmation: executionResult.requiresConfirmation,
          result: executionResult.result,
        };
        toolRuntime.onToolCallComplete?.(index, info);
      },
      onStreamProgress: toolRuntime.onProgress,
    }, toolRuntime.abortSignal);

    const allResults: ToolCallResultInfo[] = loopResult.toolResults.map((tr) => ({
      toolName: tr.toolName,
      args: tr.args,
      status: tr.requiresConfirmation ? 'pending' as const : 'completed' as const,
      requiresConfirmation: tr.requiresConfirmation,
      result: tr.result,
    }));

    return {
      data: {
        content: loopResult.content,
        toolResults: allResults,
        hasPendingConfirmation: loopResult.hasPendingConfirmation,
      },
    };
  },

  getUpdatedMessageContentFromResult: (
    result: ToolCallResult,
  ): { content: string; agentAction?: AgentAction | null } => {
    const hasToolResults = result.toolResults.length > 0;

    if (!hasToolResults) {
      return { content: result.content };
    }

    const agentAction: AgentAction = {
      type: 'tool_call',
      status: result.hasPendingConfirmation ? 'pending_confirmation' : 'completed',
      toolCalls: result.toolResults,
      currentToolIndex: result.toolResults.length - 1,
    };

    return {
      content: result.content,
      agentAction,
    };
  },
};
