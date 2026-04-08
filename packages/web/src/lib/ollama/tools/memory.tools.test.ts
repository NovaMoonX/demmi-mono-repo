import { describe, it, expect, vi } from 'vitest';
import { getMemoriesTool, saveMemoryTool } from './memory.tools';
import type { ToolContext } from './tool.types';
import type { RootState, AppDispatch } from '@store/index';

const mockState = {
  memory: {
    items: [
      { id: 'm1', userId: 'user-1', content: 'Prefers spicy food', category: 'preference', createdAt: 1000, updatedAt: 1000 },
      { id: 'm2', userId: 'user-1', content: 'Has a birthday next week', category: 'context', createdAt: 2000, updatedAt: 2000 },
    ],
  },
} as unknown as RootState;

const mockContext: ToolContext = {
  getState: vi.fn(() => mockState),
  dispatch: vi.fn() as unknown as AppDispatch,
  userId: 'user-1',
};

describe('memory.tools', () => {
  describe('get_memories', () => {
    it('returns all memories', async () => {
      const result = await getMemoriesTool.execute({}, mockContext);

      expect(result.success).toBe(true);
      const data = result.data as { items: unknown[]; total: number };
      expect(data.items).toHaveLength(2);
    });

    it('returns empty with no memories', async () => {
      const emptyContext: ToolContext = {
        getState: vi.fn(() => ({
          memory: { items: [] },
        }) as unknown as RootState),
        dispatch: vi.fn() as unknown as AppDispatch,
        userId: 'user-1',
      };

      const result = await getMemoriesTool.execute({}, emptyContext);

      expect(result.success).toBe(true);
      const data = result.data as { items: unknown[]; total: number };
      expect(data.items).toHaveLength(0);
    });
  });

  describe('save_memory', () => {
    it('returns error with empty content', async () => {
      const result = await saveMemoryTool.execute(
        { content: '', category: 'preference' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.displayType).toBe('error');
    });
  });
});
