import { describe, it, expect, vi } from 'vitest';
import { formatContextMessages, createRecipeAction } from './createRecipeAction';
import { ollamaClient } from '../ollama.service';
import { mock } from 'vitest-mock-extended';
import { ChatResponse } from 'ollama';

describe('createRecipeAction', () => {
  describe('formatContextMessages', () => {
    it('formats recent messages with limit', () => {
      const messages = [
        { id: '1', role: 'user' as const, content: 'msg1', rawContent: null, timestamp: 1, model: null, agentAction: null, summary: null, iterationInvalid: null },
        { id: '2', role: 'assistant' as const, content: 'msg2', rawContent: 'raw2', timestamp: 2, model: 'mistral', agentAction: null, summary: null, iterationInvalid: null },
        { id: '3', role: 'user' as const, content: 'msg3', rawContent: null, timestamp: 3, model: null, agentAction: null, summary: null, iterationInvalid: null },
        { id: '4', role: 'assistant' as const, content: 'msg4', rawContent: null, timestamp: 4, model: 'mistral', agentAction: null, summary: null, iterationInvalid: null },
      ];

      const result = formatContextMessages(messages, 2);
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('msg3');
    });

    it('uses rawContent when available', () => {
      const messages = [
        { id: '1', role: 'assistant' as const, content: 'display', rawContent: 'raw', timestamp: 1, model: 'mistral', agentAction: null, summary: null, iterationInvalid: null },
      ];

      const result = formatContextMessages(messages);
      expect(result[0].content).toBe('raw');
    });
  });

  describe('executeStep', () => {
    it('throws for unknown step name', async () => {
      await expect(
        createRecipeAction.executeStep(
          'mistral',
          'unknownStep' as never,
          { messages: [] },
          {},
        ),
      ).rejects.toThrow('Unknown recipe action step');
    });

    it('executes proposeName step', async () => {
      vi.mocked(ollamaClient.chat).mockResolvedValue(mock<ChatResponse>({
        message: { content: JSON.stringify({ name: 'Spaghetti Carbonara' }) },
      }));

      const result = await createRecipeAction.executeStep(
        'mistral',
        'proposeName',
        { messages: [{ id: '1', role: 'user' as const, content: 'Make pasta', rawContent: null, timestamp: 1, model: null, agentAction: null, summary: null, iterationInvalid: null }] },
        {},
      );
      expect(result.stepName).toBe('proposeName');
      expect(result.data.name).toBe('Spaghetti Carbonara');
    });
  });

  describe('getUpdatedMessageContentFromResult', () => {
    it('returns formatted content with recipe name', () => {
      const result = createRecipeAction.getUpdatedMessageContentFromResult({
        name: 'Pasta Primavera',
      });
      expect(result.content).toContain('Pasta Primavera');
    });

    it('uses default name when missing', () => {
      const result = createRecipeAction.getUpdatedMessageContentFromResult({});
      expect(result.content).toContain('your recipe');
    });
  });
});
