import type { ToolContext } from './tool.types';
import type { ToolCallRequest, ToolExecutionResult } from './toolExecutor';
import { executeToolCalls } from './toolExecutor';
import { getToolByName } from './tool.registry';
import { ollamaChatStream } from '../ollama.service';
import {
  SIMULATED_TOOL_CALL_SCHEMA,
  getResponseGenerationPrompt,
} from '../prompts/toolCalling.prompts';
import {
  parseToolCallResponse,
  extractPartialToolResponse,
  extractToolCallsFromPartialJson,
} from './streamParser';

const MAX_TOOL_CALL_ROUNDS = 3;

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
    const hasExecutedTools = allToolResults.length > 0;

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

      if (!toolCallsDetected && !hasExecutedTools) {
        const partialResponse = extractPartialToolResponse(rawContent);
        if (partialResponse) {
          callbacks?.onStreamProgress?.(partialResponse);
        }
      }
    }

    if (abortSignal?.aborted) break;

    const parsed = parseToolCallResponse(rawContent);

    if (!parsed || parsed.toolCalls.length === 0) {
      if (!hasExecutedTools) {
        finalContent = parsed?.response ?? extractPartialToolResponse(rawContent) ?? rawContent;
        callbacks?.onStreamProgress?.(finalContent);
      }
      break;
    }

    const rawToolCalls: ToolCallRequest[] = parsed.toolCalls.map((tc) => ({
      name: tc.name,
      arguments: tc.arguments ?? {},
    }));

    const seen = new Set<string>();
    const toolCallRequests = rawToolCalls.filter((tc) => {
      if (!getToolByName(tc.name)) return false;
      const sortedArgs = JSON.stringify(
        Object.keys(tc.arguments).sort().reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = tc.arguments[k];
          return acc;
        }, {}),
      );
      const key = `${tc.name}:${sortedArgs}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (toolCallRequests.length === 0) {
      if (!hasExecutedTools) {
        finalContent = parsed.response ?? '';
        if (finalContent) callbacks?.onStreamProgress?.(finalContent);
      }
      break;
    }

    if (parsed.response) {
      callbacks?.onStreamProgress?.(parsed.response);
    }

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

      finalContent = await generateResponseFromResults(
        model, conversationMessages, callbacks, abortSignal,
      );
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

  if (allToolResults.length > 0 && !hasPendingConfirmation) {
    finalContent = await generateResponseFromResults(
      model, conversationMessages, callbacks, abortSignal,
    );
  }

  return {
    content: finalContent,
    toolResults: allToolResults,
    rounds: round,
    hasPendingConfirmation,
  };
}

async function generateResponseFromResults(
  model: string,
  conversationMessages: Array<{ role: string; content: string }>,
  callbacks?: ToolCallLoopCallbacks,
  abortSignal?: AbortSignal,
): Promise<string> {
  const responsePrompt = getResponseGenerationPrompt();

  // Replace the tool-selection system prompt (index 0) with the response-generation prompt
  const responseMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: responsePrompt },
    ...conversationMessages.slice(1),
  ];

  let responseContent = '';

  const responseStream = await ollamaChatStream({
    model,
    messages: responseMessages,
    options: { temperature: 0.7 },
  });

  for await (const chunk of responseStream) {
    if (abortSignal?.aborted) break;
    responseContent += chunk.message.content;
    callbacks?.onStreamProgress?.(responseContent);
  }

  return responseContent;
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
