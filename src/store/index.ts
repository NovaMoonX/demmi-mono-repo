import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';
import mealsReducer from './slices/mealsSlice';
import chatsReducer from './slices/chatsSlice';
import userReducer from './slices/userSlice';
import calendarReducer from './slices/calendarSlice';
import demoReducer from './slices/demoSlice';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    meals: mealsReducer,
    chats: chatsReducer,
    user: userReducer,
    calendar: calendarReducer,
    demo: demoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
