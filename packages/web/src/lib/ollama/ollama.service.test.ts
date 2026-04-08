import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ollamaClient,
  listLocalModels,
  generateSummary,
  parseGeneralResponse,
  extractPartialResponse,
} from './ollama.service';
import { mock } from 'vitest-mock-extended';
import { GenerateResponse, ModelResponse } from 'ollama';

describe('ollama.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listLocalModels', () => {
    it('returns text model names', async () => {
      vi.mocked(ollamaClient.list).mockResolvedValue({
        models: mock<ModelResponse[]>([
          { name: 'mistral' },
          { name: 'llama3' },
          { name: 'nomic-embed-text' },
        ]),
      });

      const result = await listLocalModels();
      expect(result).toEqual(['mistral', 'llama3']);
    });

    it('filters out embed, vision and multimodal models', async () => {
      vi.mocked(ollamaClient.list).mockResolvedValue({
        models: mock<ModelResponse[]>([
          { name: 'llava-vision' },
          { name: 'embed-model' },
          { name: 'multimodal-test' },
        ]),
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
      vi.mocked(ollamaClient.generate).mockResolvedValue(mock<GenerateResponse>({
        response: 'User asked about pasta. Assistant provided a recipe.',
      }));

      const longUser = 'a'.repeat(101);
      const longAssistant = 'b'.repeat(201);
      const result = await generateSummary('mistral', longUser, longAssistant);
      expect(result).toBe('User asked about pasta. Assistant provided a recipe.');
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
