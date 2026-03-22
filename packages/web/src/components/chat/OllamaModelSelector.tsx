import { Select, Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { PullProgress } from '@hooks/useOllamaModels';

interface OllamaModelSelectorProps {
  models: string[];
  selectedModel: string | null;
  isLoading: boolean;
  error: string | null;
  disabled?: boolean;
  isPulling: boolean;
  pullProgress: PullProgress | null;
  pullError: string | null;
  onSelectModel: (model: string) => void;
  onPullMistral: () => void;
}

export function OllamaModelSelector({
  models,
  selectedModel,
  isLoading,
  error,
  disabled = false,
  isPulling,
  pullProgress,
  pullError,
  onSelectModel,
  onPullMistral,
}: OllamaModelSelectorProps) {
  if (isLoading) {
    return (
      <span className="text-xs text-muted-foreground animate-pulse">
        Connecting to Ollama…
      </span>
    );
  }

  if (error) {
    return (
      <span className="text-xs text-destructive" title={error}>
        ⚠️ Ollama offline
      </span>
    );
  }

  if (isPulling && pullProgress) {
    const { status, percent } = pullProgress;
    return (
      <div className="flex flex-col items-end gap-1 min-w-48">
        <span className="text-xs text-muted-foreground truncate max-w-48" title={status}>
          ⬇️ {status}
        </span>
        {percent !== null && (
          <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={join('h-full rounded-full bg-accent transition-all duration-200')}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
        {percent !== null && (
          <span className="text-xs text-muted-foreground">{percent}%</span>
        )}
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-end gap-1">
        {pullError && (
          <span className="text-xs text-destructive">{pullError}</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">No text models found.</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={onPullMistral}
            disabled={isPulling}
          >
            Download Mistral
          </Button>
        </div>
      </div>
    );
  }

  const modelOptions = models.map((model) => ({ value: model, text: model }));

  return (
    <Select
      options={modelOptions}
      value={selectedModel ?? ''}
      onChange={onSelectModel}
      placeholder="Select a model"
      className="text-xs w-48"
      disabled={disabled}
    />
  );
}
