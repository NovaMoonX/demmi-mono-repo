import { getToolByName } from './tool.registry';
import type { ToolContext, ToolResult } from './tool.types';

export interface ToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolExecutionResult {
  toolName: string;
  args: Record<string, unknown>;
  requiresConfirmation: boolean;
  result: ToolResult;
  skipped?: boolean;
}

export async function executeToolCall(
  toolCall: ToolCallRequest,
  context: ToolContext,
): Promise<ToolExecutionResult> {
  const tool = getToolByName(toolCall.name);

  if (!tool) {
    return {
      toolName: toolCall.name,
      args: toolCall.arguments,
      requiresConfirmation: false,
      result: {
        success: false,
        data: null,
        displayType: 'text',
        message: '',
      },
      skipped: true,
    };
  }

  if (tool.requiresConfirmation) {
    const result = await tool.execute(toolCall.arguments, context);
    return {
      toolName: toolCall.name,
      args: toolCall.arguments,
      requiresConfirmation: true,
      result,
    };
  }

  try {
    const result = await tool.execute(toolCall.arguments, context);
    return {
      toolName: toolCall.name,
      args: toolCall.arguments,
      requiresConfirmation: false,
      result,
    };
  } catch (err) {
    return {
      toolName: toolCall.name,
      args: toolCall.arguments,
      requiresConfirmation: false,
      result: {
        success: false,
        data: null,
        displayType: 'error',
        message: `Tool execution failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      },
    };
  }
}

export async function executeToolCalls(
  toolCalls: ToolCallRequest[],
  context: ToolContext,
  onToolComplete?: (index: number, result: ToolExecutionResult) => void,
): Promise<ToolExecutionResult[]> {
  const results: ToolExecutionResult[] = [];

  for (let i = 0; i < toolCalls.length; i++) {
    const result = await executeToolCall(toolCalls[i], context);
    if (result.skipped) continue;
    results.push(result);
    onToolComplete?.(results.length - 1, result);
  }

  return results;
}
