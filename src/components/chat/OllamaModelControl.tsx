import { useOllamaModels } from '@hooks/useOllamaModels';
import { OllamaModelSelector } from './OllamaModelSelector';

interface OllamaModelControlProps {
  disabled?: boolean;
}

/**
 * Self-contained Ollama model picker.
 * Wraps `useOllamaModels` internally so callers don't need to wire up the hook manually.
 * The selected model is persisted in Redux (`chats.selectedModel`) and is available to any
 * consumer via `useAppSelector(state => state.chats.selectedModel)`.
 */
export function OllamaModelControl({ disabled = false }: OllamaModelControlProps) {
  const {
    availableModels,
    selectedModel,
    isLoading,
    error,
    isPulling,
    pullProgress,
    pullError,
    selectModel,
    pullMistral,
  } = useOllamaModels();

  return (
    <OllamaModelSelector
      models={availableModels}
      selectedModel={selectedModel}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      isPulling={isPulling}
      pullProgress={pullProgress}
      pullError={pullError}
      onSelectModel={selectModel}
      onPullMistral={pullMistral}
    />
  );
}
