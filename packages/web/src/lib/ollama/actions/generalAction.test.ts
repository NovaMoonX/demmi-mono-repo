jest.mock('ollama/browser', () => {
  const mockClient = {
    chat: jest.fn(),
    generate: jest.fn(),
    list: jest.fn(),
    pull: jest.fn(),
  };
  return { Ollama: jest.fn(() => mockClient) };
});

jest.mock('../prompts', () => ({
  GENERAL_PROMPT: 'You are a cooking assistant.',
}));

jest.mock('../schemas', () => ({
  GENERAL_SCHEMA: {},
}));

import { generalAction } from './generalAction';
import { ollamaClient } from '../ollama.service';

describe('generalAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      abort: jest.fn(),
    };

    (ollamaClient.chat as jest.Mock).mockResolvedValue(asyncIterator);

    const onProgress = jest.fn();
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
