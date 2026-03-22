import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setSelectedModel } from '@store/slices/chatsSlice';
import { listLocalModels, pullModelStream } from '@lib/ollama';

export interface PullProgress {
  status: string;
  percent: number | null;
}

export function useOllamaModels() {
  const dispatch = useAppDispatch();
  const selectedModel = useAppSelector((state) => state.chats.selectedModel);
  const selectedModelRef = useRef(selectedModel);
  selectedModelRef.current = selectedModel;
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState<PullProgress | null>(null);
  const [pullError, setPullError] = useState<string | null>(null);

  const refreshModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const models = await listLocalModels();
      setAvailableModels(models);
      if (models.length > 0 && !selectedModelRef.current) {
        dispatch(setSelectedModel(models[0]));
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not connect to Ollama. Make sure it is running on localhost:11434.';
      setError(message);
      setAvailableModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchModels() {
      setIsLoading(true);
      setError(null);
      try {
        const models = await listLocalModels();
        if (!cancelled) {
          setAvailableModels(models);
          if (models.length > 0 && !selectedModelRef.current) {
            dispatch(setSelectedModel(models[0]));
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Could not connect to Ollama. Make sure it is running on localhost:11434.';
          setError(message);
          setAvailableModels([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchModels();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const selectModel = (model: string) => {
    dispatch(setSelectedModel(model));
  };

  const pullMistral = async () => {
    setIsPulling(true);
    setPullProgress({ status: 'Starting download...', percent: null });
    setPullError(null);

    try {
      const stream = await pullModelStream('mistral');

      for await (const chunk of stream) {
        const percent =
          chunk.total > 0
            ? Math.round((chunk.completed / chunk.total) * 100)
            : null;
        setPullProgress({ status: chunk.status, percent });
      }

      await refreshModels();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed.';
      setPullError(message);
    } finally {
      setIsPulling(false);
      setPullProgress(null);
    }
  };

  return {
    availableModels,
    selectedModel,
    isLoading,
    error,
    selectModel,
    isPulling,
    pullProgress,
    pullError,
    pullMistral,
  };
}
