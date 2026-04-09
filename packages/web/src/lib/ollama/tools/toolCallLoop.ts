import type { ToolContext } from './tool.types';
import type { ToolCallRequest, ToolExecutionResult } from './toolExecutor';
import { executeToolCalls } from './toolExecutor';
import { ollamaChatStream, ollamaChatSingle } from '../ollama.service';
import { SIMULATED_TOOL_CALL_SCHEMA } from '../prompts/toolCalling.prompts';
import {
  parseToolCallResponse,
  extractPartialToolResponse,
  extractToolCallsFromPartialJson,
} from './streamParser';

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

export async function runToolCallLoop(
  model: string,
  messages: Array<{ role: string; content: string }>,
  toolContext: ToolContext,
  callbacks?: ToolCallLoopCallbacks,
  abortSignal?: AbortSignal,
): Promise<ToolCallLoopResult> {
  const allToolResults: ToolExecutionResult[] = [];
  let round = 0;
  let hasPendingConfirmation = false;
  let finalContent = '';

  const conversationMessages: Array<{ role: string; content: string }> = [
    ...messages,
  ];

  while (round < MAX_TOOL_CALL_ROUNDS) {
    round++;

    let rawContent = '';
    let toolCallsDetected = false;

    const stream = await ollamaChatStream({
      model,
      messages: conversationMessages,
      format: SIMULATED_TOOL_CALL_SCHEMA,
      options: { temperature: 0.7 },
    });

    for await (const chunk of stream) {
      if (abortSignal?.aborted) break;

      rawContent += chunk.message.content;

      if (!toolCallsDetected) {
        const partialCalls = extractToolCallsFromPartialJson(rawContent);
        if (partialCalls && partialCalls.length > 0) {
          toolCallsDetected = true;
        }
      }

      const partialResponse = extractPartialToolResponse(rawContent);
      if (partialResponse) {
        callbacks?.onStreamProgress?.(partialResponse);
      }
    }

    if (abortSignal?.aborted) break;

    const parsed = parseToolCallResponse(rawContent);

    if (!parsed || parsed.toolCalls.length === 0) {
      finalContent = parsed?.response ?? extractPartialToolResponse(rawContent) ?? rawContent;
      callbacks?.onStreamProgress?.(finalContent);
      break;
    }

    const toolCallRequests: ToolCallRequest[] = parsed.toolCalls.map((tc) => ({
      name: tc.name,
      arguments: tc.arguments ?? {},
    }));

    callbacks?.onToolCallStart?.(toolCallRequests);

    conversationMessages.push({
      role: 'assistant',
      content: rawContent,
    });

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
          role: 'user',
          content: `[Tool Result: ${result.toolName}] ${result.requiresConfirmation
            ? `[PENDING USER CONFIRMATION] ${result.result.message}`
            : JSON.stringify({ success: result.result.success, message: result.result.message, data: result.result.data })}`,
        });
      }

      const summaryResponse = await ollamaChatSingle({
        model,
        messages: conversationMessages,
        format: SIMULATED_TOOL_CALL_SCHEMA,
      });

      const summaryParsed = parseToolCallResponse(summaryResponse.message.content);
      finalContent = summaryParsed?.response ?? summaryResponse.message.content ?? '';
      callbacks?.onStreamProgress?.(finalContent);
      break;
    }

    for (const result of results) {
      conversationMessages.push({
        role: 'user',
        content: `[Tool Result: ${result.toolName}] ${JSON.stringify({
          success: result.result.success,
          message: result.result.message,
          data: result.result.data,
        })}`,
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
