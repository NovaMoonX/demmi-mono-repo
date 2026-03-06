import { createSlice, createAsyncThunk, Dispatch } from '@reduxjs/toolkit';
import { addPlannedMeal, resetCalendar } from './calendarSlice';
import { generateDemoCalendarData } from '@lib/calendar';

interface DemoState {
  isActive: boolean;
}

const initialState: DemoState = {
  isActive: false,
};

export const loadDemoData = createAsyncThunk<void, void, { dispatch: Dispatch }>(
  'demo/loadDemoData',
  async (_, { dispatch }) => {
    dispatch(resetCalendar());
    const calendarData = generateDemoCalendarData();
    calendarData.forEach((plannedMeal) => {
      dispatch(addPlannedMeal(plannedMeal));
    });
  }
);

export const clearDemoData = createAsyncThunk<void, void, { dispatch: Dispatch }>(
  'demo/clearDemoData',
  async (_, { dispatch }) => {
    dispatch(resetCalendar());
  }
);

const demoSlice = createSlice({
  name: 'demo',
  initialState,
  reducers: {
    enableDemo: (state) => {
      state.isActive = true;
    },
    disableDemo: (state) => {
      state.isActive = false;
    },
  },
});

export const { enableDemo, disableDemo } = demoSlice.actions;

export default demoSlice.reducer;
