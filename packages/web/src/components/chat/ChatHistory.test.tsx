import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatHistory } from './ChatHistory';
import type { ChatConversation } from '@lib/chat';

function createConversation(overrides: Partial<ChatConversation> = {}): ChatConversation {
  return {
    id: 'chat-1',
    title: 'Test Chat',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: 1700000000000,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      },
    ],
    isPinned: false,
    lastUpdated: 1700000000000,
    userId: 'user-1',
    ...overrides,
  };
}

describe('ChatHistory', () => {
  const defaultProps = {
    conversations: [] as ChatConversation[],
    currentChatId: null as string | null,
    onSelectChat: vi.fn(),
    onNewChat: vi.fn(),
    onTogglePin: vi.fn(),
    onDeleteChat: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('renders "New Chat" button', () => {
    render(<ChatHistory {...defaultProps} />);
    expect(screen.getByText('New Chat')).toBeInTheDocument();
  });

  it('calls onNewChat when New Chat button is clicked', () => {
    render(<ChatHistory {...defaultProps} />);
    fireEvent.click(screen.getByText('New Chat'));
    expect(defaultProps.onNewChat).toHaveBeenCalledTimes(1);
  });

  it('shows empty message when there are no conversations', () => {
    render(<ChatHistory {...defaultProps} />);
    expect(screen.getByText(/No chat history yet/)).toBeInTheDocument();
  });

  it('renders conversation titles', () => {
    const conversations = [
      createConversation({ id: 'c-1', title: 'First Chat' }),
      createConversation({ id: 'c-2', title: 'Second Chat' }),
    ];
    render(<ChatHistory {...defaultProps} conversations={conversations} />);
    expect(screen.getByText('First Chat')).toBeInTheDocument();
    expect(screen.getByText('Second Chat')).toBeInTheDocument();
  });

  it('renders message count for each conversation', () => {
    const conversations = [createConversation({ messages: [
      { id: 'msg-1', role: 'user', content: 'Hi', timestamp: 0, model: null, rawContent: null, agentAction: null, summary: null, iterationInvalid: null },
      { id: 'msg-2', role: 'assistant', content: 'Hey', timestamp: 0, model: 'llama', rawContent: null, agentAction: null, summary: null, iterationInvalid: null },
    ] })];
    render(<ChatHistory {...defaultProps} conversations={conversations} />);
    expect(screen.getByText('2 messages')).toBeInTheDocument();
  });

  it('renders singular "message" for 1 message', () => {
    const conversations = [createConversation()];
    render(<ChatHistory {...defaultProps} conversations={conversations} />);
    expect(screen.getByText('1 message')).toBeInTheDocument();
  });

  it('calls onSelectChat when a conversation is clicked', () => {
    const conversations = [createConversation()];
    render(<ChatHistory {...defaultProps} conversations={conversations} />);
    fireEvent.click(screen.getByText('Test Chat'));
    expect(defaultProps.onSelectChat).toHaveBeenCalledWith('chat-1');
  });

  it('renders pinned section for pinned chats', () => {
    const conversations = [createConversation({ isPinned: true })];
    render(<ChatHistory {...defaultProps} conversations={conversations} />);
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });

  it('renders recent section for unpinned chats', () => {
    const conversations = [createConversation({ isPinned: false })];
    render(<ChatHistory {...defaultProps} conversations={conversations} />);
    expect(screen.getByText('Recent')).toBeInTheDocument();
  });

  it('renders pin emoji for pinned chats', () => {
    const conversations = [createConversation({ isPinned: true })];
    render(<ChatHistory {...defaultProps} conversations={conversations} />);
    const pinEmojis = screen.getAllByText('📌');
    expect(pinEmojis.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onDeleteChat when delete button is clicked', () => {
    const conversations = [createConversation()];
    render(<ChatHistory {...defaultProps} conversations={conversations} />);
    fireEvent.click(screen.getByLabelText('Delete chat'));
    expect(defaultProps.onDeleteChat).toHaveBeenCalledWith('chat-1');
  });

  it('calls onTogglePin when pin button is clicked', () => {
    const conversations = [createConversation()];
    render(<ChatHistory {...defaultProps} conversations={conversations} />);
    fireEvent.click(screen.getByLabelText('Pin chat'));
    expect(defaultProps.onTogglePin).toHaveBeenCalledWith('chat-1');
  });
});
