import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { Chat } from './Chat';

vi.mock('@components/chat/ChatHistoryToggleIcon', () => ({
  ChatHistoryToggleIcon: () => <span data-testid="chat-history-toggle-icon" />,
}));

vi.mock('@components/chat/ChatHistory', () => ({
  ChatHistory: () => <div data-testid="chat-history">ChatHistory</div>,
}));

vi.mock('@components/chat/ChatMessage', () => ({
  ChatMessage: ({ message }: { message: { content: string } }) => (
    <div data-testid="chat-message">{message.content}</div>
  ),
}));

vi.mock('@components/chat/OllamaModelControl', () => ({
  OllamaModelControl: () => <div data-testid="ollama-model-control">OllamaModelControl</div>,
}));

vi.mock('@hooks/useIsMobileDevice', () => ({
  useIsMobileDevice: () => false,
}));

vi.mock('@hooks/useOllamaModels', () => ({
  useOllamaModels: () => ({
    availableModels: ['test-model'],
    selectedModel: 'test-model',
    isLoading: false,
    error: null,
    selectModel: vi.fn(),
    isPulling: false,
    pullProgress: null,
    pullError: null,
    pullMistral: vi.fn(),
  }),
}));

vi.mock('@lib/ollama', () => ({
  detectIntent: vi.fn(),
  generateSummary: vi.fn(),
  getActionHandler: vi.fn(),
  iterateRecipeAction: vi.fn(),
}));

describe('Chat', () => {
  it('renders the New Chat heading when no conversation selected', () => {
    renderWithProviders(<Chat />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByText('New Chat')).toBeInTheDocument();
  });

  it('renders the chat history panel', () => {
    renderWithProviders(<Chat />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByTestId('chat-history')).toBeInTheDocument();
  });

  it('renders the ollama model control', () => {
    renderWithProviders(<Chat />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByTestId('ollama-model-control')).toBeInTheDocument();
  });

  it('renders the message input textarea', () => {
    renderWithProviders(<Chat />, {
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('displays the chat title when a conversation exists', () => {
    renderWithProviders(<Chat />, {
      preloadedState: {
        chats: {
          conversations: [
            {
              id: 'chat-1',
              title: 'My Test Chat',
              messages: [],
              isPinned: false,
              lastUpdated: Date.now(),
              userId: 'test-user',
            },
          ],
          currentChatId: 'chat-1',
          selectedModel: 'test-model',
        },
      },
    });
    expect(screen.getByText('My Test Chat')).toBeInTheDocument();
  });
});
