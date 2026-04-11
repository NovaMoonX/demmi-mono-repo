import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { AgentMemorySection } from './AgentMemorySection';
import type { AgentMemory } from '@lib/memory';

const mockMemories: AgentMemory[] = [
  {
    id: 'm1',
    userId: 'user-1',
    content: 'Prefers spicy food on weekends',
    category: 'preference',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'm2',
    userId: 'user-1',
    content: 'Has a birthday party next week',
    category: 'context',
    createdAt: 1700000100000,
    updatedAt: 1700000100000,
  },
];

describe('AgentMemorySection', () => {
  it('shows empty state when no memories', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { memory: { items: [] } },
    });
    render(<AgentMemorySection />, { wrapper });
    expect(screen.getByText(/No memories stored yet/)).toBeInTheDocument();
  });

  it('renders memory list when memories exist', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { memory: { items: mockMemories } },
    });
    render(<AgentMemorySection />, { wrapper });
    expect(screen.getByText('Prefers spicy food on weekends')).toBeInTheDocument();
    expect(screen.getByText('Has a birthday party next week')).toBeInTheDocument();
    expect(screen.getByText('2 memories')).toBeInTheDocument();
  });

  it('shows category badges', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { memory: { items: mockMemories } },
    });
    render(<AgentMemorySection />, { wrapper });
    expect(screen.getByText('Preference')).toBeInTheDocument();
    expect(screen.getByText('Context')).toBeInTheDocument();
  });

  it('dispatches delete when Delete button is clicked', () => {
    const { wrapper, store } = generateTestWrapper({
      preloadedState: { memory: { items: mockMemories } },
    });
    render(<AgentMemorySection />, { wrapper });
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    const memoryState = store.getState().memory;
    expect(memoryState.items).toHaveLength(2);
  });

  it('shows singular text for single memory', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { memory: { items: [mockMemories[0]] } },
    });
    render(<AgentMemorySection />, { wrapper });
    expect(screen.getByText('1 memory')).toBeInTheDocument();
  });
});
