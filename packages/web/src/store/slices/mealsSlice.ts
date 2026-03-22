import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Meal } from '@lib/meals';
import { generatedId } from '@utils/generatedId';
import {
  fetchMeals,
  createMeal as createMealAsync,
  updateMeal as updateMealAsync,
  deleteMeal as deleteMealAsync,
} from '@store/actions/mealActions';
import { shareMeal, unshareMeal } from '@store/actions/shareMealActions';

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeals.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createMealAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateMealAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteMealAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      })
      .addCase(shareMeal.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(unshareMeal.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { createMeal, updateMeal, deleteMeal, setMeals, resetMeals } = mealsSlice.actions;

export default mealsSlice.reducer;
