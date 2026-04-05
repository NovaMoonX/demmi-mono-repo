import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
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

const mockUseRuntimeEnvironment = vi.fn(() => ({
  isElectron: false,
  isMobileWebView: false,
  isOllamaAvailable: true,
}));

vi.mock('@hooks/useRuntimeEnvironment', () => ({
  useRuntimeEnvironment: () => mockUseRuntimeEnvironment(),
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

describe('Chat', () => {
  beforeEach(() => {
    mockUseRuntimeEnvironment.mockReturnValue({
      isElectron: false,
      isMobileWebView: false,
      isOllamaAvailable: true,
    });
  });

  it('renders the New Chat heading when no conversation selected', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<Chat />, { wrapper });
    expect(screen.getByText('New Chat')).toBeInTheDocument();
  });

  it('renders the chat history panel', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<Chat />, { wrapper });
    expect(screen.getByTestId('chat-history')).toBeInTheDocument();
  });

  it('renders the ollama model control', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<Chat />, { wrapper });
    expect(screen.getByTestId('ollama-model-control')).toBeInTheDocument();
  });

  it('renders the message input textarea', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<Chat />, { wrapper });
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('displays the chat title when a conversation exists', () => {
    const { wrapper } = generateTestWrapper({
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
    render(<Chat />, { wrapper });
    expect(screen.getByText('My Test Chat')).toBeInTheDocument();
  });

  it('shows mobile disabled state when isMobileWebView is true', () => {
    mockUseRuntimeEnvironment.mockReturnValue({
      isElectron: false,
      isMobileWebView: true,
      isOllamaAvailable: false,
    });
    const { wrapper } = generateTestWrapper({
      preloadedState: {
        chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
      },
    });
    render(<Chat />, { wrapper });
    expect(screen.getByText('AI Chat requires Ollama')).toBeInTheDocument();
    expect(screen.getByText('Learn how to set up Ollama →')).toBeInTheDocument();
    expect(screen.getByText('Cloud AI for mobile is coming soon.')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-history')).not.toBeInTheDocument();
  });
});
