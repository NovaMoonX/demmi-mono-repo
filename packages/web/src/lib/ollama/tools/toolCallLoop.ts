import type { ToolContext } from './tool.types';
import type { ToolCallRequest, ToolExecutionResult } from './toolExecutor';
import { executeToolCalls } from './toolExecutor';
import { getToolsForOllama } from './tool.registry';
import { ollamaChatWithTools, ollamaChatSingle } from '../ollama.service';

const MAX_TOOL_CALL_ROUNDS = 10;

export interface ToolCallLoopCallbacks {
  onToolCallStart?: (toolCalls: ToolCallRequest[]) => void;
  onToolCallComplete?: (index: number, result: ToolExecutionResult) => void;
  onStreamProgress?: (content: string) => void;
  onRoundComplete?: (round: number) => void;
}

export interface ToolCallLoopResult {
  content: string;
  toolResults: ToolExecutionResult[];
  rounds: number;
  hasPendingConfirmation: boolean;
}

interface OllamaToolCallMessage {
  role: string;
  content: string;
  tool_calls?: Array<{
    function: {
      name: string;
      arguments: Record<string, unknown>;
    };
  }>;
}

export async function runToolCallLoop(
  model: string,
  messages: Array<{ role: string; content: string }>,
  toolContext: ToolContext,
  callbacks?: ToolCallLoopCallbacks,
): Promise<ToolCallLoopResult> {
  const tools = getToolsForOllama();
  const allToolResults: ToolExecutionResult[] = [];
  let round = 0;
  let hasPendingConfirmation = false;
  let finalContent = '';

  const conversationMessages: Array<{ role: string; content: string; tool_calls?: unknown }> = [
    ...messages,
  ];

  while (round < MAX_TOOL_CALL_ROUNDS) {
    round++;

    const response = await ollamaChatWithTools({
      model,
      messages: conversationMessages as Array<{ role: string; content: string }>,
      tools,
      options: { temperature: 0.7 },
    }) as unknown as { message: OllamaToolCallMessage };

    const responseMessage = response.message;
    const toolCalls = responseMessage.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      finalContent = responseMessage.content ?? '';
      callbacks?.onStreamProgress?.(finalContent);
      break;
    }

    conversationMessages.push({
      role: 'assistant',
      content: responseMessage.content ?? '',
      tool_calls: toolCalls,
    });

    const toolCallRequests: ToolCallRequest[] = toolCalls.map((tc) => ({
      name: tc.function.name,
      arguments: tc.function.arguments,
    }));

    callbacks?.onToolCallStart?.(toolCallRequests);

    const results = await executeToolCalls(
      toolCallRequests,
      toolContext,
      callbacks?.onToolCallComplete,
    );

    allToolResults.push(...results);

    const confirmationResults = results.filter((r) => r.requiresConfirmation);
    if (confirmationResults.length > 0) {
      hasPendingConfirmation = true;

      for (const result of results) {
        conversationMessages.push({
          role: 'tool',
          content: result.requiresConfirmation
            ? `[PENDING USER CONFIRMATION] ${result.result.message}`
            : JSON.stringify({ success: result.result.success, message: result.result.message, data: result.result.data }),
        });
      }

      const summaryResponse = await ollamaChatSingle({
        model,
        messages: conversationMessages as Array<{ role: string; content: string }>,
      });

      finalContent = summaryResponse.message.content ?? '';
      callbacks?.onStreamProgress?.(finalContent);
      break;
    }

    for (const result of results) {
      conversationMessages.push({
        role: 'tool',
        content: JSON.stringify({
          success: result.result.success,
          message: result.result.message,
          data: result.result.data,
        }),
      });
    }

    callbacks?.onRoundComplete?.(round);
  }

  return {
    content: finalContent,
    toolResults: allToolResults,
    rounds: round,
    hasPendingConfirmation,
  };
}

export function buildToolCallMessages(
  systemPrompt: string,
  chatHistory: Array<{ role: string; content: string }>,
): Array<{ role: string; content: string }> {
  const result = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
  ];
  return result;
}
