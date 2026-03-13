import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatConversation, ChatMessage } from '@lib/chat';
import type {
  AgentAction,
  AgentActionStatus,
  AgentCreateMealAction,
  AgentMealProposal,
} from '@lib/chat/agent-actions.types';
import { generatedId } from '@utils/generatedId';
import {
  fetchChats,
  createChat,
  updateChat,
  deleteChat,
  addChatMessage,
  fetchChatMessages,
} from '@store/actions/chatActions';

interface ChatsState {
  conversations: ChatConversation[];
  currentChatId: string | null;
  selectedModel: string | null;
}

const initialState: ChatsState = {
  conversations: [],
  currentChatId: null,
  selectedModel: null,
};

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<string | null>) => {
      state.currentChatId = action.payload;
    },
    createConversation: (
      state,
      action: PayloadAction<Omit<ChatConversation, 'id'>>,
    ) => {
      const newConversation: ChatConversation = {
        ...action.payload,
        id: generatedId('chat'),
      };

      state.conversations.unshift(newConversation);
      state.currentChatId = newConversation.id;
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: ChatMessage }>,
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.chatId,
      );

      if (conversation) {
        conversation.messages.push(action.payload.message);
        conversation.lastUpdated = Date.now();
      }
    },
    removeMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>,
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.chatId,
      );

      if (conversation) {
        conversation.messages = conversation.messages.filter(
          (m) => m.id !== action.payload.messageId,
        );
        conversation.lastUpdated = Date.now();
      }
    },
    updateConversation: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Omit<ChatConversation, 'id'>>;
      }>,
    ) => {
      const index = state.conversations.findIndex(
        (c) => c.id === action.payload.id,
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
        (c) => c.id !== action.payload,
      );

      if (state.currentChatId === action.payload) {
        state.currentChatId = state.conversations[0]?.id ?? null;
      }
    },
    togglePinConversation: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload,
      );

      if (conversation) {
        conversation.isPinned = !conversation.isPinned;
      }
    },
    setConversations: (state, action: PayloadAction<ChatConversation[]>) => {
      state.conversations = action.payload;
      state.currentChatId = action.payload[0]?.id ?? null;
    },
    setSelectedModel: (state, action: PayloadAction<string | null>) => {
      state.selectedModel = action.payload;
    },
    trimMessagesFrom: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>,
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.chatId,
      );
      if (conversation) {
        const index = conversation.messages.findIndex(
          (m) => m.id === action.payload.messageId,
        );
        if (index !== -1) {
          conversation.messages = conversation.messages.slice(0, index);
          conversation.lastUpdated = Date.now();
        }
      }
    },
    updateMessageContent: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        model?: string | null;
        content: string;
        rawContent?: string | null;
        agentAction?: AgentAction | null;
      }>,
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.chatId,
      );
      if (conversation) {
        const message = conversation.messages.find(
          (m) => m.id === action.payload.messageId,
        );
        if (message) {
          message.content = action.payload.content;
          if (action.payload.model !== undefined) {
            message.model = action.payload.model;
          }
          if (action.payload.rawContent !== undefined) {
            message.rawContent = action.payload.rawContent;
          }
          if (action.payload.agentAction !== undefined) {
            message.agentAction = action.payload.agentAction;
          }
        }
      }
    },
    updateAgentActionStatus: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        status: AgentActionStatus;
        meals?: AgentMealProposal[];
      }>,
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.chatId,
      );
      if (conversation) {
        const message = conversation.messages.find(
          (m) => m.id === action.payload.messageId,
        );
        if (message?.agentAction) {
          message.agentAction.status = action.payload.status;
          if (
            action.payload.meals !== undefined &&
            message.agentAction.type === 'create_meal'
          ) {
            (message.agentAction as AgentCreateMealAction).meals =
              action.payload.meals;
          }
        }
      }
    },
    updateMessageSummary: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        summary: string | null;
      }>,
    ) => {
      const { chatId, messageId, summary } = action.payload;
      const chat = state.conversations.find((c) => c.id === chatId);
      if (chat) {
        const message = chat.messages.find((m) => m.id === messageId);
        if (message) {
          message.summary = summary;
        }
      }
    },
    resetChats: (state) => {
      state.conversations = [];
      state.currentChatId = null;
      state.selectedModel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.currentChatId = action.payload[0]?.id ?? null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.currentChatId = action.payload.id;
      })
      .addCase(updateChat.fulfilled, (state, action) => {
        const index = state.conversations.findIndex(
          (c) => c.id === action.payload.id,
        );
        if (index !== -1) {
          state.conversations[index] = {
            ...state.conversations[index],
            ...action.payload,
          };
        }
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(
          (c) => c.id !== action.payload,
        );
        if (state.currentChatId === action.payload) {
          state.currentChatId = state.conversations[0]?.id ?? null;
        }
      })
      .addCase(addChatMessage.fulfilled, (state, action) => {
        const conversation = state.conversations.find(
          (c) => c.id === action.payload.chatId,
        );
        if (conversation) {
          conversation.messages.push(action.payload.message);
          conversation.lastUpdated = action.payload.lastUpdated;
        }
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const conversation = state.conversations.find(
          (c) => c.id === action.payload.chatId,
        );
        if (conversation) {
          conversation.messages = action.payload.messages;
        }
      });
  },
});

export const {
  setCurrentChat,
  createConversation,
  addMessage,
  removeMessage,
  trimMessagesFrom,
  updateConversation,
  deleteConversation,
  togglePinConversation,
  setConversations,
  setSelectedModel,
  updateMessageContent,
  updateAgentActionStatus,
  updateMessageSummary,
  resetChats,
} = chatsSlice.actions;

export default chatsSlice.reducer;
