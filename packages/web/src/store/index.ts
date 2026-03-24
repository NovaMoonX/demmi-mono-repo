import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';
import recipesReducer from './slices/recipesSlice';
import chatsReducer from './slices/chatsSlice';
import userReducer from './slices/userSlice';
import calendarReducer from './slices/calendarSlice';
import demoReducer from './slices/demoSlice';
import shoppingListReducer from './slices/shoppingListSlice';
import userProfileReducer from './slices/userProfileSlice';
import { openFoodFactsApi } from './api/openFoodFactsApi';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    recipes: recipesReducer,
    chats: chatsReducer,
    user: userReducer,
    calendar: calendarReducer,
    demo: demoReducer,
    shoppingList: shoppingListReducer,
    userProfile: userProfileReducer,
    [openFoodFactsApi.reducerPath]: openFoodFactsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(openFoodFactsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
