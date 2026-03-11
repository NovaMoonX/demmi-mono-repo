import { Ollama } from 'ollama/browser';
import type { AbortableAsyncIterator } from 'ollama';
import type { ChatResponse, ProgressResponse } from 'ollama/browser';
import { ChatMessage } from '@lib/chat';

const SYSTEM_PROMPT =
  'You are Demmi\'s AI assistant, specialized in helping users with cooking, recipes, meal planning, ingredients, and nutrition. ' +
  'Help users discover new meals, plan their weekly menu, understand ingredient combinations, and make informed food choices. ' +
  'Be concise, friendly, and practical.';

export const ollamaClient = new Ollama();

export async function listLocalModels(): Promise<string[]> {
  const response = await ollamaClient.list();
  const allModels = response.models.map((m) => m.name);

  const textModels = allModels.filter((name) => {
    const lowerName = name.toLowerCase();
    return !lowerName.includes('embed') && !lowerName.includes('vision') && !lowerName.includes('multimodal');
  });

  return textModels;
}

export async function startChatStream(
  model: string,
  messages: ChatMessage[],
): Promise<AbortableAsyncIterator<ChatResponse>> {
  const ollamaMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  return ollamaClient.chat({
    model,
    messages: ollamaMessages,
    stream: true,
  });
}

export async function pullModelStream(
  model: string,
): Promise<AbortableAsyncIterator<ProgressResponse>> {
  return ollamaClient.pull({ model, stream: true });
}
