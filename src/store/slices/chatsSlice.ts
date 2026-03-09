import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ChatConversation,
  ChatMessage,
} from '@lib/chat';
import { generatedId } from '@utils/generatedId';

interface ChatsState {
  conversations: ChatConversation[];
  currentChatId: string | null;
}

const initialState: ChatsState = {
  conversations: [],
  currentChatId: null,
};

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<string | null>) => {
      state.currentChatId = action.payload;
    },
    createConversation: (state, action: PayloadAction<Omit<ChatConversation, 'id'>>) => {
      const newConversation: ChatConversation = {
        ...action.payload,
        id: generatedId('chat'),
      };

      state.conversations.unshift(newConversation);
      state.currentChatId = newConversation.id;
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: ChatMessage }>
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.chatId
      );

      if (conversation) {
        conversation.messages.push(action.payload.message);
        conversation.lastUpdated = Date.now();
      }
    },
    updateConversation: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<ChatConversation, 'id'>> }>
    ) => {
      const index = state.conversations.findIndex(
        (c) => c.id === action.payload.id
      );

      if (index !== -1) {
        state.conversations[index] = {
          ...state.conversations[index],
          ...action.payload.updates,
        };
      }
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(
        (c) => c.id !== action.payload
      );

      if (state.currentChatId === action.payload) {
        state.currentChatId = state.conversations[0]?.id ?? null;
      }
    },
    togglePinConversation: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload
      );

      if (conversation) {
        conversation.isPinned = !conversation.isPinned;
      }
    },
    setConversations: (state, action: PayloadAction<ChatConversation[]>) => {
      state.conversations = action.payload;
      state.currentChatId = action.payload[0]?.id ?? null;
    },
    resetChats: (state) => {
      state.conversations = [];
      state.currentChatId = null;
    },
  },
});

export const {
  setCurrentChat,
  createConversation,
  addMessage,
  updateConversation,
  deleteConversation,
  togglePinConversation,
  setConversations,
  resetChats,
} = chatsSlice.actions;

export default chatsSlice.reducer;
