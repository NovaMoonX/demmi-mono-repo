import { render, screen } from '@testing-library/react';
import { OllamaModelControl } from './OllamaModelControl';

const mockSelectModel = jest.fn();
const mockPullMistral = jest.fn();

jest.mock('@hooks/useOllamaModels', () => ({
  useOllamaModels: () => ({
    availableModels: ['mistral', 'llama3'],
    selectedModel: 'mistral',
    isLoading: false,
    error: null,
    isPulling: false,
    pullProgress: null,
    pullError: null,
    selectModel: mockSelectModel,
    pullMistral: mockPullMistral,
  }),
}));

jest.mock('./OllamaModelSelector', () => ({
  OllamaModelSelector: (props: Record<string, unknown>) => (
    <div data-testid="model-selector" data-models={JSON.stringify(props.models)} data-selected={props.selectedModel as string} />
  ),
}));

describe('OllamaModelControl', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the OllamaModelSelector', () => {
    render(<OllamaModelControl />);
    expect(screen.getByTestId('model-selector')).toBeInTheDocument();
  });

  it('passes available models to selector', () => {
    render(<OllamaModelControl />);
    const selector = screen.getByTestId('model-selector');
    expect(selector.getAttribute('data-models')).toBe(JSON.stringify(['mistral', 'llama3']));
  });

  it('passes selected model to selector', () => {
    render(<OllamaModelControl />);
    const selector = screen.getByTestId('model-selector');
    expect(selector.getAttribute('data-selected')).toBe('mistral');
  });
});
