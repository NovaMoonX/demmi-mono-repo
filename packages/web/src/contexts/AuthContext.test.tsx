import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@store/slices/userSlice';
import demoReducer from '@store/slices/demoSlice';
import ingredientsReducer from '@store/slices/ingredientsSlice';
import recipesReducer from '@store/slices/recipesSlice';
import chatsReducer from '@store/slices/chatsSlice';
import calendarReducer from '@store/slices/calendarSlice';
import shoppingListReducer from '@store/slices/shoppingListSlice';
import { openFoodFactsApi } from '@store/api/openFoodFactsApi';
import { AuthProvider } from './AuthContext';
import { useAuth } from '@hooks/useAuth';

let authStateCallback: ((user: unknown) => void) | null = null;

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: unknown) => void) => {
    authStateCallback = cb;
    cb(null);
    return vi.fn();
  }),
}));

function TestConsumer() {
  const { user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.uid : 'none'}</span>
    </div>
  );
}

function createTestStore() {
  return configureStore({
    reducer: {
      ingredients: ingredientsReducer,
      recipes: recipesReducer,
      chats: chatsReducer,
      user: userReducer,
      calendar: calendarReducer,
      demo: demoReducer,
      shoppingList: shoppingListReducer,
      [openFoodFactsApi.reducerPath]: openFoodFactsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(openFoodFactsApi.middleware),
  });
}

describe('AuthProvider', () => {
  it('renders children', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <AuthProvider>
          <div data-testid="child">Hello</div>
        </AuthProvider>
      </Provider>,
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('provides auth context with null user initially', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </Provider>,
    );
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('updates user when auth state changes', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </Provider>,
    );

    await act(async () => {
      authStateCallback?.({ uid: 'u1', email: 'a@b.com', emailVerified: true });
    });

    expect(screen.getByTestId('user')).toHaveTextContent('u1');
  });
});
