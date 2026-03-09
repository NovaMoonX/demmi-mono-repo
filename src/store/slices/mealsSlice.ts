import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Meal } from '@lib/meals';
import { generatedId } from '@utils/generatedId';

interface MealsState {
  items: Meal[];
}

const initialState: MealsState = {
  items: [],
};

const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    createMeal: (state, action: PayloadAction<Omit<Meal, 'id'>>) => {
      const newMeal: Meal = {
        ...action.payload,
        ingredients: action.payload.ingredients ?? [],
        id: generatedId('meal'),
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
    setMeals: (state, action: PayloadAction<Meal[]>) => {
      state.items = action.payload;
    },
    resetMeals: (state) => {
      state.items = [];
    },
  },
});

export const { createMeal, updateMeal, deleteMeal, setMeals, resetMeals } = mealsSlice.actions;

export default mealsSlice.reducer;
