import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import demoReducer from '@store/slices/demoSlice';
import userReducer from '@store/slices/userSlice';
import memoryReducer from '@store/slices/memorySlice';
import {
  fetchMemories,
  createMemoryAsync,
  updateMemoryAsync,
  deleteMemoryAsync,
} from './memoryActions';

vi.mock('@utils/generatedId', () => ({
  generatedId: vi.fn(() => 'mem-id-123'),
}));

function createTestStore(demoActive: boolean) {
  return configureStore({
    reducer: {
      demo: demoReducer,
      user: userReducer,
      memory: memoryReducer,
    },
    preloadedState: {
      demo: { isActive: demoActive, isHydrated: true } as never,
      user: {
        user: { uid: 'user1', email: 'a@b.com', emailVerified: true },
        loading: false,
      } as never,
      memory: { items: [] } as never,
    },
  });
}

describe('memoryActions', () => {
  describe('fetchMemories', () => {
    it('skips execution when demo mode is active', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(fetchMemories());
      expect(result.meta.requestStatus).toBe('rejected');
      expect(
        (result as ReturnType<typeof fetchMemories.rejected>).meta.condition,
      ).toBe(true);
    });
  });

  describe('createMemoryAsync', () => {
    it('returns local data in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(
        createMemoryAsync({
          content: 'Prefers spicy food on weekends',
          category: 'preference',
          createdAt: 1000,
          updatedAt: 1000,
        }),
      );
      expect(result.type).toBe('memory/createMemoryAsync/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      expect(payload.userId).toBe('demo');
      expect(payload.id).toBe('mem-id-123');
      expect(payload.content).toBe('Prefers spicy food on weekends');
    });
  });

  describe('updateMemoryAsync', () => {
    it('returns memory as-is in demo mode', async () => {
      const store = createTestStore(true);
      const memory = {
        id: 'm1',
        userId: 'demo',
        content: 'Updated memory content',
        category: 'context' as const,
        createdAt: 1000,
        updatedAt: 2000,
      };
      const result = await store.dispatch(updateMemoryAsync(memory));
      expect(result.type).toBe('memory/updateMemoryAsync/fulfilled');
      expect(result.payload).toEqual(memory);
    });
  });

  describe('deleteMemoryAsync', () => {
    it('returns id in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(deleteMemoryAsync('m1'));
      expect(result.type).toBe('memory/deleteMemoryAsync/fulfilled');
      expect(result.payload).toBe('m1');
    });
  });
});
