import {
  extractPartialResponse,
  ollamaChatStream,
  parseGeneralResponse,
} from '../ollama.service';
import { GENERAL_PROMPT } from '../prompts';
import { GENERAL_SCHEMA } from '../schemas';
import type { ActionHandler, ActionResult, ActionContext, ActionRuntime } from './types';

const MAX_CONTEXT_MESSAGES = 5;

interface GeneralResult extends Record<string, unknown> {
  content: string;
  rawContent: string | null;
}

export const generalAction = {
  type: 'general',
  description: 'General conversational response about cooking, nutrition, and meal planning',
  isMultiStep: false,

  async execute(model: string, context: ActionContext<GeneralResult>, runtime: ActionRuntime): Promise<ActionResult<GeneralResult>> {
    const { messages } = context;
    const { abortSignal, onProgress } = runtime;

    const stream = await ollamaChatStream({
      model,
      messages: [
        { role: 'system', content: GENERAL_PROMPT },
        ...messages.slice(-MAX_CONTEXT_MESSAGES).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.rawContent ?? m.content,
        })),
      ],
      format: GENERAL_SCHEMA,
    });

    let rawContent = '';

    for await (const chunk of stream) {
      if (abortSignal?.aborted) {
        stream.abort();
        break;
      }

      rawContent += chunk.message.content;

      const displayContent = extractPartialResponse(rawContent);

      if (displayContent) {
        onProgress?.(displayContent);
      }
    }

    const parsed = parseGeneralResponse(rawContent);
    const content = parsed?.response ?? rawContent;
    const rawContentUsed = !!parsed?.response;

    return { data: { content, rawContent: rawContentUsed ? null : rawContent } };
  },

  getUpdatedMessageContentFromResult(result: GeneralResult) {
    return {
      content: result.content,
      rawContent: result.rawContent,
      agentAction: null,
    };
  },
} satisfies ActionHandler<GeneralResult>;