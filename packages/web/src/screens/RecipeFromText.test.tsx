import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { RecipeFromText } from './RecipeFromText';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

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
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByText('Paste Your Recipe')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(
      screen.getByText(
        "Someone sent you a recipe? Paste the full text below and we'll take it from there.",
      ),
    ).toBeInTheDocument();
  });

  it('renders the back link', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
  });

  it('renders the textarea', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('renders Generate and Cancel buttons', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders the OllamaModelControl', () => {
    renderWithProviders(<RecipeFromText />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByTestId('ollama-model-control')).toBeInTheDocument();
  });
});
