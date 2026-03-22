import { render, RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ReactElement } from 'react';

import ingredientsReducer from '@store/slices/ingredientsSlice';
import recipesReducer from '@store/slices/recipesSlice';
import chatsReducer from '@store/slices/chatsSlice';
import userReducer from '@store/slices/userSlice';
import calendarReducer from '@store/slices/calendarSlice';
import demoReducer from '@store/slices/demoSlice';
import shoppingListReducer from '@store/slices/shoppingListSlice';
import { openFoodFactsApi } from '@store/api/openFoodFactsApi';
import type { RootState } from '@store/index';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  route?: string;
  withRouter?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
) {
  const {
    preloadedState,
    route = '/',
    withRouter = true,
    ...renderOptions
  } = options;

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
    preloadedState: preloadedState as RootState,
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    if (withRouter) {
      return (
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            {children}
          </MemoryRouter>
        </Provider>
      );
    }
    return <Provider store={store}>{children}</Provider>;
  }

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });
  return { ...result, store };
}
