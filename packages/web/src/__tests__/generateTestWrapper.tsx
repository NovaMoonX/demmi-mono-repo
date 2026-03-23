import { configureStore } from '@reduxjs/toolkit';
import { RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { openFoodFactsApi } from '@store/api/openFoodFactsApi';
import type { RootState } from '@store/index';
import calendarReducer from '@store/slices/calendarSlice';
import chatsReducer from '@store/slices/chatsSlice';
import demoReducer from '@store/slices/demoSlice';
import ingredientsReducer from '@store/slices/ingredientsSlice';
import recipesReducer from '@store/slices/recipesSlice';
import shoppingListReducer from '@store/slices/shoppingListSlice';
import userReducer from '@store/slices/userSlice';

interface GenerateTestWrapperOptions extends Omit<RenderOptions, 'wrapper'> {
  /** The initial state for the Redux store */
  preloadedState?: Partial<RootState>;
  /** The initial route for the MemoryRouter */
  route?: string;
  /** The path for the Route component */
  path?: string;
  /** Whether to wrap with MemoryRouter (default: true) */
  withRouter?: boolean;
}

export function generateTestWrapper(options?: GenerateTestWrapperOptions) {
  const {
    preloadedState = {},
    route = '/',
    path,
    withRouter = true,
  } = options || {};

  const finalPreloadedState: Partial<RootState> = {
    user: {
      user: { uid: 'user-1', email: 'test@example.com', emailVerified: true },
      loading: false,
    },
    ...preloadedState,
  };

  const store = configureStore({
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
    preloadedState: finalPreloadedState as RootState,
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    if (withRouter) {
      return (
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            {path ? (
              <Routes>
                <Route path={path} element={children as ReactElement} />
              </Routes>
            ) : (
              children
            )}
          </MemoryRouter>
        </Provider>
      );
    }

    return <Provider store={store}>{children}</Provider>;
  };

  return { wrapper, store };
}
