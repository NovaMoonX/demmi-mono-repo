import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { RecipeFromText } from './RecipeFromText';

vi.mock('@components/chat/OllamaModelControl', () => ({
  OllamaModelControl: () => <div data-testid="ollama-model-control">OllamaModelControl</div>,
}));

vi.mock('@lib/ollama/actions', () => ({
  createRecipeAction: {
    execute: vi.fn().mockResolvedValue({ cancelled: false, data: { proposal: null } }),
  },
}));

describe('RecipeFromText', () => {
  it('renders the page title', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<RecipeFromText />, { wrapper });
    expect(screen.getByText('Paste Your Recipe')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<RecipeFromText />, { wrapper });
    expect(
      screen.getByText(
        "Someone sent you a recipe? Paste the full text below and we'll take it from there.",
      ),
    ).toBeInTheDocument();
  });

  it('renders the back link', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<RecipeFromText />, { wrapper });
    expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
  });

  it('renders the textarea', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<RecipeFromText />, { wrapper });
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('renders Generate and Cancel buttons', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<RecipeFromText />, { wrapper });
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders the OllamaModelControl', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<RecipeFromText />, { wrapper });
    expect(screen.getByTestId('ollama-model-control')).toBeInTheDocument();
  });
});
