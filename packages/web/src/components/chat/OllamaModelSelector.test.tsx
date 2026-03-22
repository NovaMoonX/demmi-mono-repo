import { render, screen, fireEvent } from '@testing-library/react';
import { OllamaModelSelector } from './OllamaModelSelector';

const baseProps = {
  models: ['mistral', 'llama3'],
  selectedModel: 'mistral',
  isLoading: false,
  error: null,
  disabled: false,
  isPulling: false,
  pullProgress: null,
  pullError: null,
  onSelectModel: jest.fn(),
  onPullMistral: jest.fn(),
};

describe('OllamaModelSelector', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders a select dropdown when models are available', () => {
    render(<OllamaModelSelector {...baseProps} />);
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('renders model options', () => {
    render(<OllamaModelSelector {...baseProps} />);
    expect(screen.getByText('mistral')).toBeInTheDocument();
    expect(screen.getByText('llama3')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<OllamaModelSelector {...baseProps} isLoading />);
    expect(screen.getByText(/Connecting to Ollama/)).toBeInTheDocument();
  });

  it('shows error state when error is provided', () => {
    render(<OllamaModelSelector {...baseProps} error="Connection refused" />);
    expect(screen.getByText(/Ollama offline/)).toBeInTheDocument();
  });

  it('shows pull progress when isPulling with progress', () => {
    render(
      <OllamaModelSelector
        {...baseProps}
        isPulling
        pullProgress={{ status: 'Downloading model', percent: 45 }}
      />,
    );
    expect(screen.getByText(/Downloading model/)).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('shows "No text models found" and download button when models list is empty', () => {
    render(<OllamaModelSelector {...baseProps} models={[]} />);
    expect(screen.getByText(/No text models found/)).toBeInTheDocument();
    expect(screen.getByText('Download Mistral')).toBeInTheDocument();
  });

  it('calls onPullMistral when Download Mistral is clicked', () => {
    render(<OllamaModelSelector {...baseProps} models={[]} />);
    fireEvent.click(screen.getByText('Download Mistral'));
    expect(baseProps.onPullMistral).toHaveBeenCalledTimes(1);
  });

  it('shows pull error when pullError is set and models are empty', () => {
    render(<OllamaModelSelector {...baseProps} models={[]} pullError="Download failed" />);
    expect(screen.getByText('Download failed')).toBeInTheDocument();
  });

  it('calls onSelectModel when a model is selected', () => {
    render(<OllamaModelSelector {...baseProps} />);
    fireEvent.change(screen.getByTestId('select'), { target: { value: 'llama3' } });
    expect(baseProps.onSelectModel).toHaveBeenCalledWith('llama3');
  });
});
