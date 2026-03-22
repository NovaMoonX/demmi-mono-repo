import { renderHook, act, waitFor } from '@testing-library/react';

const mockDispatch = jest.fn();
jest.mock('@store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ chats: { selectedModel: null } }),
}));

const mockListLocalModels = jest.fn();
const mockPullModelStream = jest.fn();
jest.mock('@lib/ollama', () => ({
  listLocalModels: (...args: unknown[]) => mockListLocalModels(...args),
  pullModelStream: (...args: unknown[]) => mockPullModelStream(...args),
}));

jest.mock('@store/slices/chatsSlice', () => ({
  setSelectedModel: (model: string) => ({ type: 'chats/setSelectedModel', payload: model }),
}));

import { useOllamaModels } from './useOllamaModels';

describe('useOllamaModels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads models on mount', async () => {
    mockListLocalModels.mockResolvedValue(['mistral', 'llama3']);

    const { result } = renderHook(() => useOllamaModels());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.availableModels).toEqual(['mistral', 'llama3']);
    expect(result.current.error).toBeNull();
  });

  it('sets error when listLocalModels fails', async () => {
    mockListLocalModels.mockRejectedValue(new Error('Connection refused'));

    const { result } = renderHook(() => useOllamaModels());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Connection refused');
    expect(result.current.availableModels).toEqual([]);
  });

  it('selectModel dispatches setSelectedModel', () => {
    mockListLocalModels.mockResolvedValue([]);

    const { result } = renderHook(() => useOllamaModels());

    act(() => {
      result.current.selectModel('llama3');
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'chats/setSelectedModel', payload: 'llama3' }),
    );
  });
});
