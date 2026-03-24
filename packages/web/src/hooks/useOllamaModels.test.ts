import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOllamaModels } from './useOllamaModels';

const mockListLocalModels = vi.fn();
const mockPullModelStream = vi.fn();
vi.mock('@lib/ollama', () => ({
  listLocalModels: (...args: unknown[]) => mockListLocalModels(...args),
  pullModelStream: (...args: unknown[]) => mockPullModelStream(...args),
}));

describe('useOllamaModels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads models on mount', async () => {
    mockListLocalModels.mockResolvedValue(['mistral', 'llama3']);

    const { wrapper } = generateTestWrapper();
    const { result } = renderHook(() => useOllamaModels(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.availableModels).toEqual(['mistral', 'llama3']);
    expect(result.current.error).toBeNull();
  });

  it('sets error when listLocalModels fails', async () => {
    mockListLocalModels.mockRejectedValue(new Error('Connection refused'));

    const { wrapper } = generateTestWrapper();
    const { result } = renderHook(() => useOllamaModels(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Connection refused');
    expect(result.current.availableModels).toEqual([]);
  });

  it('selectModel dispatches setSelectedModel', () => {
    mockListLocalModels.mockResolvedValue([]);

    const { wrapper, store } = generateTestWrapper();
    const { result } = renderHook(() => useOllamaModels(), { wrapper });

    act(() => {
      result.current.selectModel('llama3');
    });

    expect(store.getState().chats.selectedModel).toBe('llama3');
  });
});
