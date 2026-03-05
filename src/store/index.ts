import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';
import mealsReducer from './slices/mealsSlice';
import chatsReducer from './slices/chatsSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    meals: mealsReducer,
    chats: chatsReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
