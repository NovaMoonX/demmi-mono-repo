import { describe, it, expect } from 'vitest';
import reducer, {
  setMemories,
  addMemory,
  updateMemory,
  deleteMemory,
  resetMemories,
} from './memorySlice';
import type { AgentMemory } from '@lib/memory';

const mockMemory: AgentMemory = {
  id: 'm1',
  userId: 'u1',
  content: 'Prefers spicy food',
  category: 'preference',
  createdAt: 1000,
  updatedAt: 1000,
};

describe('memorySlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ items: [] });
  });

  it('handles setMemories', () => {
    const state = reducer(undefined, setMemories([mockMemory]));
    expect(state.items).toEqual([mockMemory]);
  });

  it('handles addMemory', () => {
    const state = reducer(undefined, addMemory(mockMemory));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(mockMemory);
  });

  it('handles updateMemory', () => {
    const initial = { items: [mockMemory] };
    const state = reducer(
      initial,
      updateMemory({ id: 'm1', updates: { content: 'Updated content' } }),
    );
    expect(state.items[0].content).toBe('Updated content');
  });

  it('handles updateMemory for non-existent id', () => {
    const initial = { items: [mockMemory] };
    const state = reducer(
      initial,
      updateMemory({ id: 'nonexistent', updates: { content: 'Nope' } }),
    );
    expect(state.items[0].content).toBe('Prefers spicy food');
  });

  it('handles deleteMemory', () => {
    const initial = { items: [mockMemory] };
    const state = reducer(initial, deleteMemory('m1'));
    expect(state.items).toHaveLength(0);
  });

  it('handles resetMemories', () => {
    const initial = { items: [mockMemory] };
    const state = reducer(initial, resetMemories());
    expect(state.items).toHaveLength(0);
  });
});
