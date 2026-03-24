import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generalAction } from './generalAction';
import { ollamaClient } from '../ollama.service';
import { ChatResponse } from 'ollama';


describe('generalAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct type and description', () => {
    expect(generalAction.type).toBe('general');
    expect(generalAction.isMultiStep).toBe(false);
  });

  it('streams response and calls onProgress', async () => {
    const chunks = [
      { message: { content: '{"response": "' } },
      { message: { content: 'Hello!' } },
      { message: { content: '"}' } },
    ];

    const asyncIterator = {
      [Symbol.asyncIterator]() {
        let i = 0;
        return {
          async next() {
            if (i < chunks.length) return { value: chunks[i++], done: false };
            return { value: undefined, done: true };
          },
        };
      },
      abort: vi.fn(),
    } as unknown as ChatResponse;

    vi.mocked(ollamaClient.chat).mockResolvedValue(asyncIterator);

    const onProgress = vi.fn();
    const result = await generalAction.execute(
      'mistral',
      { messages: [{ id: '1', role: 'user' as const, content: 'Hi', rawContent: null, timestamp: 1, model: null, agentAction: null, summary: null, iterationInvalid: null }] },
      { onProgress },
    );

    expect(result.data.content).toBeDefined();
    expect(onProgress).toHaveBeenCalled();
  });

  describe('getUpdatedMessageContentFromResult', () => {
    it('returns content from result', () => {
      const result = generalAction.getUpdatedMessageContentFromResult({
        content: 'Hello!',
        rawContent: null,
      });
      expect(result.content).toBe('Hello!');
      expect(result.agentAction).toBeNull();
    });
  });
});
