import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { Chat } from './Chat';

jest.mock('@components/chat/ChatHistoryToggleIcon', () => ({
  ChatHistoryToggleIcon: () => <span data-testid="chat-history-toggle-icon" />,
}));

jest.mock('@components/chat/ChatHistory', () => ({
  ChatHistory: () => <div data-testid="chat-history">ChatHistory</div>,
}));

jest.mock('@components/chat/ChatMessage', () => ({
  ChatMessage: ({ message }: { message: { content: string } }) => (
    <div data-testid="chat-message">{message.content}</div>
  ),
}));

jest.mock('@components/chat/OllamaModelControl', () => ({
  OllamaModelControl: () => <div data-testid="ollama-model-control">OllamaModelControl</div>,
}));

jest.mock('@hooks/useIsMobileDevice', () => ({
  useIsMobileDevice: () => false,
}));

jest.mock('@hooks/useOllamaModels', () => ({
  useOllamaModels: () => ({
    availableModels: ['test-model'],
    selectedModel: 'test-model',
    isLoading: false,
    error: null,
    selectModel: jest.fn(),
    isPulling: false,
    pullProgress: null,
    pullError: null,
    pullMistral: jest.fn(),
  }),
}));

jest.mock('@lib/ollama', () => ({
  detectIntent: jest.fn(),
  generateSummary: jest.fn(),
  getActionHandler: jest.fn(),
  iterateRecipeAction: jest.fn(),
}));

jest.mock('@store/actions/ingredientActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    fetchIngredients: createAsyncThunk('ingredients/fetch', async () => []),
    createIngredient: createAsyncThunk('ingredients/create', async () => ({})),
    updateIngredient: createAsyncThunk('ingredients/update', async () => ({})),
    deleteIngredient: createAsyncThunk('ingredients/delete', async () => ({})),
  };
});

jest.mock('@store/actions/recipeActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    fetchRecipes: createAsyncThunk('recipes/fetch', async () => []),
    createRecipe: createAsyncThunk('recipes/create', async () => ({})),
    updateRecipe: createAsyncThunk('recipes/update', async () => ({})),
    deleteRecipe: createAsyncThunk('recipes/delete', async () => ({})),
  };
});

jest.mock('@store/actions/shareRecipeActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    shareRecipe: createAsyncThunk('recipes/share', async () => ({})),
    unshareRecipe: createAsyncThunk('recipes/unshare', async () => ({})),
    fetchSharedRecipe: createAsyncThunk('recipes/fetchShared', async () => null),
  };
});

jest.mock('@store/actions/shoppingListActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    fetchShoppingList: createAsyncThunk('shoppingList/fetch', async () => []),
    createShoppingListItem: createAsyncThunk('shoppingList/create', async () => ({})),
    updateShoppingListItem: createAsyncThunk('shoppingList/update', async () => ({})),
    deleteShoppingListItem: createAsyncThunk('shoppingList/delete', async () => ({})),
    clearCheckedShoppingListItems: createAsyncThunk('shoppingList/clearChecked', async () => ({})),
  };
});

jest.mock('@store/actions/chatActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    fetchChats: createAsyncThunk('chats/fetch', async () => []),
    createChat: createAsyncThunk('chats/create', async () => ({})),
    updateChat: createAsyncThunk('chats/update', async () => ({})),
    deleteChat: createAsyncThunk('chats/delete', async () => ({})),
    addChatMessage: createAsyncThunk('chats/addMessage', async () => ({})),
    fetchChatMessages: createAsyncThunk('chats/fetchMessages', async () => []),
  };
});

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
