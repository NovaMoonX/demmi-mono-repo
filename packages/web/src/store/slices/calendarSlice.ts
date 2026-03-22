import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlannedRecipe } from '@lib/calendar';
import { generatedId } from '@utils/generatedId';
import {
  fetchPlannedRecipes,
  createPlannedRecipe as createPlannedRecipeAsync,
  updatePlannedRecipe as updatePlannedRecipeAsync,
  deletePlannedRecipe as deletePlannedRecipeAsync,
} from '@store/actions/calendarActions';

interface CalendarState {
  plannedRecipes: PlannedRecipe[];
}

const initialState: CalendarState = {
  plannedRecipes: [],
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    addPlannedRecipe: (state, action: PayloadAction<Omit<PlannedRecipe, 'id'>>) => {
      const newPlannedRecipe: PlannedRecipe = {
        ...action.payload,
        id: generatedId('planned'),
      };

      state.plannedRecipes.push(newPlannedRecipe);
    },
    updatePlannedRecipe: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<PlannedRecipe, 'id'>> }>
    ) => {
      const index = state.plannedRecipes.findIndex((pm) => pm.id === action.payload.id);

      if (index !== -1) {
        state.plannedRecipes[index] = { ...state.plannedRecipes[index], ...action.payload.updates };
      }
    },
    removePlannedRecipe: (state, action: PayloadAction<string>) => {
      state.plannedRecipes = state.plannedRecipes.filter((pm) => pm.id !== action.payload);
    },
    setPlannedRecipes: (state, action: PayloadAction<PlannedRecipe[]>) => {
      state.plannedRecipes = action.payload;
    },
    resetCalendar: (state) => {
      state.plannedRecipes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlannedRecipes.fulfilled, (state, action) => {
        state.plannedRecipes = action.payload;
      })
      .addCase(createPlannedRecipeAsync.fulfilled, (state, action) => {
        state.plannedRecipes.push(action.payload);
      })
      .addCase(updatePlannedRecipeAsync.fulfilled, (state, action) => {
        const index = state.plannedRecipes.findIndex((pm) => pm.id === action.payload.id);
        if (index !== -1) {
          state.plannedRecipes[index] = action.payload;
        }
      })
      .addCase(deletePlannedRecipeAsync.fulfilled, (state, action) => {
        state.plannedRecipes = state.plannedRecipes.filter((pm) => pm.id !== action.payload);
      });
  },
});

export const { addPlannedRecipe, updatePlannedRecipe, removePlannedRecipe, setPlannedRecipes, resetCalendar } = calendarSlice.actions;

export default calendarSlice.reducer;
