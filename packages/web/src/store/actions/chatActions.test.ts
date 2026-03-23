import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import demoReducer from '@store/slices/demoSlice';
import userReducer from '@store/slices/userSlice';
import chatsReducer from '@store/slices/chatsSlice';
import {
  fetchChats,
  createChat,
  updateChat,
  deleteChat,
  addChatMessage,
  fetchChatMessages,
} from './chatActions';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn((val: unknown) => val),
  runTransaction: vi.fn(),
}));

vi.mock('@utils/generatedId', () => ({
  generatedId: vi.fn(() => 'chat-id-123'),
}));

function createTestStore(demoActive: boolean, userId: string | null = 'user1') {
  return configureStore({
    reducer: {
      demo: demoReducer,
      user: userReducer,
      chats: chatsReducer,
    },
    preloadedState: {
      demo: { isActive: demoActive, isHydrated: true } as never,
      user: {
        user: userId
          ? { uid: userId, email: 'a@b.com', emailVerified: true }
          : null,
        loading: false,
      } as never,
      chats: {
        conversations: [],
        selectedModel: null,
        loading: false,
        error: null,
      } as never,
    },
  });
}

describe('chatActions', () => {
  describe('fetchChats', () => {
    it('skips execution when demo mode is active', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(fetchChats());
      expect(result.meta.requestStatus).toBe('rejected');
      expect(
        (result as ReturnType<typeof fetchChats.rejected>).meta.condition,
      ).toBe(true);
    });
  });

  describe('createChat', () => {
    it('returns local data in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(
        createChat({
          title: 'Test Chat',
          messages: [],
          isPinned: false,
          lastUpdated: Date.now(),
        }),
      );
      expect(result.type).toBe('chats/createChat/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      expect(payload.userId).toBe('demo');
      expect(payload.id).toBe('chat-id-123');
    });
  });

  describe('updateChat', () => {
    it('returns chat as-is in demo mode', async () => {
      const store = createTestStore(true);
      const chat = {
        id: 'c1',
        userId: 'demo',
        title: 'Updated',
        messages: [],
        isPinned: false,
        lastUpdated: Date.now(),
      };
      const result = await store.dispatch(updateChat(chat));
      expect(result.type).toBe('chats/updateChat/fulfilled');
      expect(result.payload).toEqual(chat);
    });
  });

  describe('deleteChat', () => {
    it('returns id in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(deleteChat('c1'));
      expect(result.type).toBe('chats/deleteChat/fulfilled');
      expect(result.payload).toBe('c1');
    });
  });

  describe('addChatMessage', () => {
    it('returns message data in demo mode', async () => {
      const store = createTestStore(true);
      const message = {
        id: 'm1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: Date.now(),
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      };
      const result = await store.dispatch(
        addChatMessage({ chatId: 'c1', message }),
      );
      expect(result.type).toBe('chats/addChatMessage/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      expect(payload.chatId).toBe('c1');
      expect(payload.message).toEqual(message);
    });
  });

  describe('fetchChatMessages', () => {
    it('returns existing messages in demo mode', async () => {
      const store = configureStore({
        reducer: {
          demo: demoReducer,
          user: userReducer,
          chats: chatsReducer,
        },
        preloadedState: {
          demo: { isActive: true, isHydrated: true } as never,
          user: { user: null, loading: false } as never,
          chats: {
            conversations: [
              { id: 'c1', messages: [{ id: 'm1', content: 'Hi' }] },
            ],
            selectedModel: null,
            loading: false,
            error: null,
          } as never,
        },
      });

      const result = await store.dispatch(fetchChatMessages('c1'));
      expect(result.type).toBe('chats/fetchChatMessages/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      expect(payload.chatId).toBe('c1');
    });
  });
});
