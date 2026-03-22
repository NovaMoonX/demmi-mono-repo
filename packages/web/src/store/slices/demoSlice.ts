import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@store/index';
import { addPlannedRecipe, resetCalendar } from './calendarSlice';
import { setConversations, resetChats } from './chatsSlice';
import { setRecipes, resetRecipes } from './recipesSlice';
import { setIngredients, resetIngredients } from './ingredientsSlice';
import { setShoppingList, resetShoppingList } from './shoppingListSlice';
import { clearUserData } from './userSlice';
import { generateDemoCalendarData } from '@lib/calendar';
import { mockChatConversations } from '@lib/chat';
import { mockRecipes } from '@lib/recipes';
import { mockIngredients } from '@lib/ingredients';
import { mockShoppingList } from '@lib/shoppingList';

interface DemoState {
  isActive: boolean;
  isHydrated: boolean;
}

const DEMO_SESSION_STORAGE_KEY = 'demmi-demo-active';

function getStoredDemoSessionActive(): boolean {
  try {
    const storedValue = sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY);
    const isStoredDemoActive = storedValue === 'true';

    return isStoredDemoActive;
  } catch {
    const defaultResult = false;

    return defaultResult;
  }
}

function setStoredDemoSessionActive(isActive: boolean): void {
  try {
    if (isActive) {
      sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, 'true');
      return;
    }

    sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  } catch {
    // Ignore session storage failures.
  }
}

const initialState: DemoState = {
  isActive: false,
  isHydrated: false,
};

export const loadDemoData = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'demo/loadDemoData',
  async (_, { dispatch }) => {
    dispatch(setConversations(mockChatConversations));
    dispatch(setRecipes(mockRecipes));
    dispatch(setIngredients(
      mockIngredients.map((ing) => ({ ...ing, otherUnit: null, defaultProductId: null }))
    ));
    dispatch(setShoppingList(mockShoppingList));
    dispatch(resetCalendar());
    const calendarData = generateDemoCalendarData();
    calendarData.forEach((plannedRecipe) => {
      dispatch(addPlannedRecipe(plannedRecipe));
    });
  }
);

export const clearDemoData = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'demo/clearDemoData',
  async (_, { dispatch }) => {
    dispatch(resetChats());
    dispatch(resetRecipes());
    dispatch(resetIngredients());
    dispatch(resetCalendar());
    dispatch(resetShoppingList());
  }
);

export const initializeDemoSession = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'demo/initializeDemoSession',
  async (_, { dispatch }) => {
    const isDemoSessionActive = getStoredDemoSessionActive();

    if (!isDemoSessionActive) {
      return;
    }

    dispatch(enableDemo());
    await dispatch(loadDemoData());
  }
);

export const startDemoSession = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'demo/startDemoSession',
  async (_, { dispatch }) => {
    setStoredDemoSessionActive(true);
    dispatch(enableDemo());
    await dispatch(loadDemoData());
  }
);

export const endDemoSession = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'demo/endDemoSession',
  async (_, { dispatch }) => {
    setStoredDemoSessionActive(false);
    await dispatch(clearDemoData());
    dispatch(disableDemo());
  }
);

export const endDemoSessionIfActive = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'demo/endDemoSessionIfActive',
  async (_, { dispatch }) => {
    await dispatch(endDemoSession());
  },
  { condition: (_, { getState }) => getState().demo.isActive }
);

export const clearUserDataUnlessDemo = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>(
  'demo/clearUserDataUnlessDemo',
  async (_, { dispatch }) => {
    await dispatch(clearUserData());
  },
  { condition: (_, { getState }) => !getState().demo.isActive }
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
  extraReducers: (builder) => {
    builder
      .addCase(initializeDemoSession.fulfilled, (state) => {
        state.isHydrated = true;
      })
      .addCase(initializeDemoSession.rejected, (state) => {
        state.isHydrated = true;
      });
  },
});

export const { enableDemo, disableDemo } = demoSlice.actions;

export default demoSlice.reducer;
