import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlannedMeal } from '@lib/calendar';
import { generatedId } from '@utils/generatedId';
import {
  fetchPlannedMeals,
  createPlannedMeal as createPlannedMealAsync,
  updatePlannedMeal as updatePlannedMealAsync,
  deletePlannedMeal as deletePlannedMealAsync,
} from '@store/actions/calendarActions';

interface CalendarState {
  plannedMeals: PlannedMeal[];
}

const initialState: CalendarState = {
  plannedMeals: [],
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    addPlannedMeal: (state, action: PayloadAction<Omit<PlannedMeal, 'id'>>) => {
      const newPlannedMeal: PlannedMeal = {
        ...action.payload,
        id: generatedId('planned'),
      };

      state.plannedMeals.push(newPlannedMeal);
    },
    updatePlannedMeal: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<PlannedMeal, 'id'>> }>
    ) => {
      const index = state.plannedMeals.findIndex((pm) => pm.id === action.payload.id);

      if (index !== -1) {
        state.plannedMeals[index] = { ...state.plannedMeals[index], ...action.payload.updates };
      }
    },
    removePlannedMeal: (state, action: PayloadAction<string>) => {
      state.plannedMeals = state.plannedMeals.filter((pm) => pm.id !== action.payload);
    },
    setPlannedMeals: (state, action: PayloadAction<PlannedMeal[]>) => {
      state.plannedMeals = action.payload;
    },
    resetCalendar: (state) => {
      state.plannedMeals = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlannedMeals.fulfilled, (state, action) => {
        state.plannedMeals = action.payload;
      })
      .addCase(createPlannedMealAsync.fulfilled, (state, action) => {
        state.plannedMeals.push(action.payload);
      })
      .addCase(updatePlannedMealAsync.fulfilled, (state, action) => {
        const index = state.plannedMeals.findIndex((pm) => pm.id === action.payload.id);
        if (index !== -1) {
          state.plannedMeals[index] = action.payload;
        }
      })
      .addCase(deletePlannedMealAsync.fulfilled, (state, action) => {
        state.plannedMeals = state.plannedMeals.filter((pm) => pm.id !== action.payload);
      });
  },
});

export const { addPlannedMeal, updatePlannedMeal, removePlannedMeal, setPlannedMeals, resetCalendar } = calendarSlice.actions;

export default calendarSlice.reducer;
