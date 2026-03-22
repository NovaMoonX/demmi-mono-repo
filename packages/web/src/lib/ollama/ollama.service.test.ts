import { describe, it, expect, beforeEach, vi } from 'vitest';
vi.mock('ollama/browser', () => {
  const mockClient = {
    list: vi.fn(),
    generate: vi.fn(),
    chat: vi.fn(),
    pull: vi.fn(),
  };
  class MockOllama {
    list = mockClient.list;
    generate = mockClient.generate;
    chat = mockClient.chat;
    pull = mockClient.pull;
  }
  return {
    Ollama: MockOllama,
  };
});

vi.mock('./ollama.constants', () => ({
  INTENT_ACTIONS: ['general', 'createRecipe'],
  INTENT_ACTION_PROMPT_DESCRIPTION: {
    general: 'General question',
    createRecipe: 'Create a recipe',
  },
  INTENT_ACTION_SHORT_DESCRIPTIONS: {
    general: 'General',
    createRecipe: 'Create',
  },
}));

import {
  ollamaClient,
  listLocalModels,
  generateSummary,
  detectIntent,
  parseGeneralResponse,
  extractPartialResponse,
} from './ollama.service';

describe('ollama.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listLocalModels', () => {
    it('returns text model names', async () => {
      (ollamaClient.list as jest.Mock).mockResolvedValue({
        models: [
          { name: 'mistral' },
          { name: 'llama3' },
          { name: 'nomic-embed-text' },
        ],
      });

      const result = await listLocalModels();
      expect(result).toEqual(['mistral', 'llama3']);
    });

    it('filters out embed, vision and multimodal models', async () => {
      (ollamaClient.list as jest.Mock).mockResolvedValue({
        models: [
          { name: 'llava-vision' },
          { name: 'embed-model' },
          { name: 'multimodal-test' },
        ],
      });

      const result = await listLocalModels();
      expect(result).toEqual([]);
    });
  });

  describe('generateSummary', () => {
    it('returns empty string for short exchanges', async () => {
      const result = await generateSummary('mistral', 'hi', 'hello');
      expect(result).toBe('');
    });

    it('generates summary for long exchanges', async () => {
      (ollamaClient.generate as jest.Mock).mockResolvedValue({
        response: 'User asked about pasta. Assistant provided a recipe.',
      });

      const longUser = 'a'.repeat(101);
      const longAssistant = 'b'.repeat(201);
      const result = await generateSummary('mistral', longUser, longAssistant);
      expect(result).toBe('User asked about pasta. Assistant provided a recipe.');
    });
  });

  describe('detectIntent', () => {
    it('returns general by default on error', async () => {
      (ollamaClient.generate as jest.Mock).mockRejectedValue(new Error('fail'));

      const result = await detectIntent('mistral', [
        { id: '1', role: 'user', content: 'Hello', timestamp: 1, model: null, rawContent: null, agentAction: null, summary: null, iterationInvalid: null },
      ]);
      expect(result).toBe('general');
    });

    it('detects createRecipe intent', async () => {
      (ollamaClient.generate as jest.Mock).mockResolvedValue({
        response: JSON.stringify({ action: 'createRecipe' }),
      });

      const result = await detectIntent('mistral', [
        { id: '1', role: 'user', content: 'Make me a pasta recipe', timestamp: 1, model: null, rawContent: null, agentAction: null, summary: null, iterationInvalid: null },
      ]);
      expect(result).toBe('createRecipe');
    });
  });

  describe('parseGeneralResponse', () => {
    it('parses valid JSON', () => {
      const result = parseGeneralResponse('{"response": "Hello there!"}');
      expect(result).toEqual({ response: 'Hello there!' });
    });

    it('returns null for invalid JSON', () => {
      const result = parseGeneralResponse('not json');
      expect(result).toBeNull();
    });

    it('returns empty response for non-object', () => {
      const result = parseGeneralResponse('"just a string"');
      expect(result).toBeNull();
    });

    it('returns empty string for missing response field', () => {
      const result = parseGeneralResponse('{"other": "value"}');
      expect(result).toEqual({ response: '' });
    });
  });

  describe('extractPartialResponse', () => {
    it('extracts partial response from JSON stream', () => {
      const result = extractPartialResponse('{"response": "Hello wor');
      expect(result).toBe('Hello wor');
    });

    it('returns empty for no match', () => {
      const result = extractPartialResponse('{"other":');
      expect(result).toBe('');
    });

    it('handles complete response', () => {
      const result = extractPartialResponse('{"response": "Complete answer"}');
      expect(result).toBe('Complete answer');
    });
  });
});
