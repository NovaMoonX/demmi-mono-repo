import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@lib/chat';

vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock('./agent-action-cards/CreateRecipeAgentActionCard', () => ({
  CreateRecipeAgentActionCard: () => <div data-testid="agent-action-card" />,
}));

function createMessage(overrides: Partial<ChatMessageType> = {}): ChatMessageType {
  return {
    id: 'msg-1',
    role: 'user',
    content: 'Hello world',
    timestamp: 1700000000000,
    model: null,
    rawContent: null,
    agentAction: null,
    summary: null,
    iterationInvalid: null,
    ...overrides,
  };
}

describe('ChatMessage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders user message content', () => {
    render(<ChatMessage message={createMessage()} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders assistant message with markdown', () => {
    const msg = createMessage({ role: 'assistant', content: 'AI response', model: 'llama' });
    render(<ChatMessage message={msg} />);
    expect(screen.getByTestId('markdown')).toBeInTheDocument();
    expect(screen.getByText('AI response')).toBeInTheDocument();
  });

  it('does not render markdown for user messages', () => {
    render(<ChatMessage message={createMessage()} />);
    expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
  });

  it('renders streaming indicator when streaming with empty content', () => {
    const msg = createMessage({ role: 'assistant', content: '', model: 'llama' });
    render(<ChatMessage message={msg} isStreaming />);
    const dots = screen.getAllByText('●');
    expect(dots.length).toBe(3);
  });

  it('renders copy button for non-empty messages', () => {
    render(<ChatMessage message={createMessage()} />);
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
  });

  it('renders edit button for user messages', () => {
    const onEdit = vi.fn();
    render(<ChatMessage message={createMessage()} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('does not render edit button for assistant messages', () => {
    const msg = createMessage({ role: 'assistant', content: 'Response', model: 'llama' });
    render(<ChatMessage message={msg} />);
    expect(screen.queryByText('edit')).not.toBeInTheDocument();
  });

  it('renders timestamp when showDetails is true', () => {
    render(<ChatMessage message={createMessage()} showDetails />);
    const timeEl = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timeEl).toBeInTheDocument();
  });

  it('renders model name for assistant messages when showDetails is true', () => {
    const msg = createMessage({ role: 'assistant', content: 'Hi', model: 'mistral' });
    render(<ChatMessage message={msg} showDetails />);
    expect(screen.getByText('mistral')).toBeInTheDocument();
  });

  it('does not render actions when streaming', () => {
    const msg = createMessage({ content: 'typing...' });
    render(<ChatMessage message={msg} isStreaming />);
    expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
  });

  it('does not render actions for empty content', () => {
    const msg = createMessage({ content: '' });
    const { container } = render(<ChatMessage message={msg} />);
    expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
  });
});
