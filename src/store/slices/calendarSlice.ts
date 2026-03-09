import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlannedMeal } from '@lib/calendar';
import { generatedId } from '@utils/generatedId';

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
    resetCalendar: (state) => {
      state.plannedMeals = [];
    },
  },
});

export const { addPlannedMeal, updatePlannedMeal, removePlannedMeal, resetCalendar } = calendarSlice.actions;

export default calendarSlice.reducer;
