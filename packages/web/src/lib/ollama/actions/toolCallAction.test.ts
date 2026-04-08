import { describe, it, expect } from 'vitest';
import { toolCallAction } from './toolCallAction';
import type { ToolCallResult } from './toolCallAction';
import type { AgentAction } from '../action-types';

type ResultFn = (result: ToolCallResult) => {
  content: string;
  rawContent?: string | null;
  agentAction?: AgentAction | null;
};

const getMessageContent = toolCallAction.getUpdatedMessageContentFromResult as ResultFn;

describe('toolCallAction', () => {
  it('is a single-step action handler', () => {
    expect(toolCallAction.isMultiStep).toBe(false);
    expect(toolCallAction.type).toBe('toolCall');
  });

  it('has getUpdatedMessageContentFromResult defined', () => {
    expect(toolCallAction.getUpdatedMessageContentFromResult).toBeDefined();
  });

  it('returns content only when no tool results', () => {
    const result: ToolCallResult = {
      content: 'Hello!',
      toolResults: [],
      hasPendingConfirmation: false,
    };
    const output = getMessageContent(result);
    expect(output.content).toBe('Hello!');
    expect(output.agentAction).toBeUndefined();
  });

  it('returns agentAction when tool results exist', () => {
    const result: ToolCallResult = {
      content: 'Found 3 recipes.',
      toolResults: [
        {
          toolName: 'search_recipes',
          args: { query: 'pasta' },
          status: 'completed',
          requiresConfirmation: false,
          result: { success: true, data: [], displayType: 'list', message: 'ok' },
        },
      ],
      hasPendingConfirmation: false,
    };
    const output = getMessageContent(result);
    expect(output.content).toBe('Found 3 recipes.');
    expect(output.agentAction).toBeDefined();
    expect(output.agentAction?.type).toBe('tool_call');
    expect(output.agentAction?.status).toBe('completed');
  });

  it('sets pending_confirmation status when tool needs confirmation', () => {
    const result: ToolCallResult = {
      content: 'Delete recipe?',
      toolResults: [
        {
          toolName: 'delete_recipe',
          args: { recipe_id: 'r1' },
          status: 'pending',
          requiresConfirmation: true,
          result: { success: true, data: {}, displayType: 'confirmation', message: 'Confirm?' },
        },
      ],
      hasPendingConfirmation: true,
    };
    const output = getMessageContent(result);
    expect(output.agentAction?.status).toBe('pending_confirmation');
  });
});
