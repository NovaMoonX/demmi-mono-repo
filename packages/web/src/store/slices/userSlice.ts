import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '@lib/firebase/auth.service';
import type { AppDispatch } from '@store/index';
import { fetchIngredients } from '@store/actions/ingredientActions';
import { fetchRecipes } from '@store/actions/recipeActions';
import { fetchChats } from '@store/actions/chatActions';
import { fetchPlannedRecipes } from '@store/actions/calendarActions';
import { fetchShoppingList } from '@store/actions/shoppingListActions';
import { fetchUserProfile } from '@store/actions/userProfileActions';
import { resetIngredients } from './ingredientsSlice';
import { resetRecipes } from './recipesSlice';
import { resetChats } from './chatsSlice';
import { resetCalendar } from './calendarSlice';
import { resetShoppingList } from './shoppingListSlice';
import { clearProfile } from './userProfileSlice';

interface UserState {
  user: AuthUser | null;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  loading: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
    },
  },
});

const loadUserData = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'user/loadUserData',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchIngredients()).unwrap(),
      dispatch(fetchRecipes()).unwrap(),
      dispatch(fetchChats()).unwrap(),
      dispatch(fetchPlannedRecipes()).unwrap(),
      dispatch(fetchShoppingList()).unwrap(),
      dispatch(fetchUserProfile()).unwrap(),
    ]);
  },
);

const clearUserData = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'user/clearUserData',
  async (_, { dispatch }) => {
    dispatch(resetIngredients());
    dispatch(resetRecipes());
    dispatch(resetChats());
    dispatch(resetCalendar());
    dispatch(resetShoppingList());
    dispatch(clearProfile());
  },
);

export const { setUser, setLoading, clearUser } = userSlice.actions;

export { loadUserData, clearUserData };

export default userSlice.reducer;
