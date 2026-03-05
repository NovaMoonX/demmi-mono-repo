import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Meal, mockMeals } from '@lib/meals';

interface MealsState {
  items: Meal[];
}

const initialState: MealsState = {
  items: mockMeals,
};

const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    createMeal: (state, action: PayloadAction<Omit<Meal, 'id'>>) => {
      const newMeal: Meal = {
        ...action.payload,
        id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      };

      state.items.push(newMeal);
    },
    updateMeal: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<Meal, 'id'>> }>
    ) => {
      const index = state.items.findIndex((meal) => meal.id === action.payload.id);

      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    deleteMeal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((meal) => meal.id !== action.payload);
    },
  },
});

export const { createMeal, updateMeal, deleteMeal } = mealsSlice.actions;

export default mealsSlice.reducer;
