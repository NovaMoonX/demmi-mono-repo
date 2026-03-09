import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ingredient } from '@lib/ingredients';
import { generatedId } from '@utils/generatedId';

interface IngredientsState {
  items: Ingredient[];
}

const initialState: IngredientsState = {
  items: [],
};

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    createIngredient: (state, action: PayloadAction<Omit<Ingredient, 'id'> & { id?: string }>) => {
      const { id: presetId, ...rest } = action.payload;
      const newIngredient: Ingredient = {
        ...rest,
        id: presetId ?? generatedId('ingredient'),
      };

      state.items.push(newIngredient);
    },
    updateIngredient: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<Ingredient, 'id'>> }>
    ) => {
      const index = state.items.findIndex((ing) => ing.id === action.payload.id);

      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    deleteIngredient: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((ing) => ing.id !== action.payload);
    },
    setIngredients: (state, action: PayloadAction<Ingredient[]>) => {
      state.items = action.payload;
    },
    resetIngredients: (state) => {
      state.items = [];
    },
  },
});

export const { createIngredient, updateIngredient, deleteIngredient, setIngredients, resetIngredients } =
  ingredientsSlice.actions;

export default ingredientsSlice.reducer;
