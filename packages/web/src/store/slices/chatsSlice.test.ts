import reducer, {
  setCurrentChat,
  createConversation,
  addMessage,
  removeMessage,
  updateConversation,
  deleteConversation,
  togglePinConversation,
  setConversations,
  setSelectedModel,
  trimMessagesFrom,
  updateMessageContent,
  resetChats,
} from './chatsSlice';
import type { ChatConversation, ChatMessage } from '@lib/chat';

function createMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    role: 'user',
    content: 'Hello',
    timestamp: 1700000000000,
    model: null,
    rawContent: null,
    agentAction: null,
    summary: null,
    iterationInvalid: null,
    ...overrides,
  };
}

function createConvo(overrides: Partial<ChatConversation> = {}): ChatConversation {
  return {
    id: 'chat-1',
    title: 'Test Chat',
    messages: [createMessage()],
    isPinned: false,
    lastUpdated: 1700000000000,
    userId: 'user-1',
    ...overrides,
  };
}

describe('chatsSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      conversations: [],
      currentChatId: null,
      selectedModel: null,
    });
  });

  it('handles setCurrentChat', () => {
    const state = reducer(undefined, setCurrentChat('chat-1'));
    expect(state.currentChatId).toBe('chat-1');
  });

  it('handles createConversation', () => {
    const { id: _id, ...withoutId } = createConvo();
    const state = reducer(undefined, createConversation(withoutId));
    expect(state.conversations).toHaveLength(1);
    expect(state.conversations[0].title).toBe('Test Chat');
    expect(state.currentChatId).toBe(state.conversations[0].id);
  });

  it('handles addMessage', () => {
    const initial = { conversations: [createConvo({ messages: [] })], currentChatId: 'chat-1', selectedModel: null };
    const msg = createMessage({ id: 'msg-new', content: 'New message' });
    const state = reducer(initial, addMessage({ chatId: 'chat-1', message: msg }));
    expect(state.conversations[0].messages).toHaveLength(1);
    expect(state.conversations[0].messages[0].content).toBe('New message');
  });

  it('handles removeMessage', () => {
    const initial = {
      conversations: [createConvo()],
      currentChatId: 'chat-1',
      selectedModel: null,
    };
    const state = reducer(initial, removeMessage({ chatId: 'chat-1', messageId: 'msg-1' }));
    expect(state.conversations[0].messages).toHaveLength(0);
  });

  it('handles updateConversation', () => {
    const initial = { conversations: [createConvo()], currentChatId: 'chat-1', selectedModel: null };
    const state = reducer(initial, updateConversation({ id: 'chat-1', updates: { title: 'Updated' } }));
    expect(state.conversations[0].title).toBe('Updated');
  });

  it('handles deleteConversation and resets currentChatId', () => {
    const convo2 = createConvo({ id: 'chat-2', title: 'Second' });
    const initial = {
      conversations: [createConvo(), convo2],
      currentChatId: 'chat-1',
      selectedModel: null,
    };
    const state = reducer(initial, deleteConversation('chat-1'));
    expect(state.conversations).toHaveLength(1);
    expect(state.currentChatId).toBe('chat-2');
  });

  it('handles togglePinConversation', () => {
    const initial = { conversations: [createConvo()], currentChatId: 'chat-1', selectedModel: null };
    const state = reducer(initial, togglePinConversation('chat-1'));
    expect(state.conversations[0].isPinned).toBe(true);
    const toggled = reducer(state, togglePinConversation('chat-1'));
    expect(toggled.conversations[0].isPinned).toBe(false);
  });

  it('handles setConversations', () => {
    const convos = [createConvo(), createConvo({ id: 'chat-2' })];
    const state = reducer(undefined, setConversations(convos));
    expect(state.conversations).toHaveLength(2);
    expect(state.currentChatId).toBe('chat-1');
  });

  it('handles setSelectedModel', () => {
    const state = reducer(undefined, setSelectedModel('llama3'));
    expect(state.selectedModel).toBe('llama3');
  });

  it('handles trimMessagesFrom', () => {
    const messages = [
      createMessage({ id: 'msg-1' }),
      createMessage({ id: 'msg-2' }),
      createMessage({ id: 'msg-3' }),
    ];
    const initial = {
      conversations: [createConvo({ messages })],
      currentChatId: 'chat-1',
      selectedModel: null,
    };
    const state = reducer(initial, trimMessagesFrom({ chatId: 'chat-1', messageId: 'msg-2' }));
    expect(state.conversations[0].messages).toHaveLength(1);
    expect(state.conversations[0].messages[0].id).toBe('msg-1');
  });

  it('handles updateMessageContent', () => {
    const initial = {
      conversations: [createConvo()],
      currentChatId: 'chat-1',
      selectedModel: null,
    };
    const state = reducer(initial, updateMessageContent({
      chatId: 'chat-1',
      messageId: 'msg-1',
      content: 'Updated content',
    }));
    expect(state.conversations[0].messages[0].content).toBe('Updated content');
  });

  it('handles resetChats', () => {
    const initial = {
      conversations: [createConvo()],
      currentChatId: 'chat-1',
      selectedModel: 'llama3',
    };
    const state = reducer(initial, resetChats());
    expect(state).toEqual({
      conversations: [],
      currentChatId: null,
      selectedModel: null,
    });
  });
});
