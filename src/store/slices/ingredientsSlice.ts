import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ingredient, mockIngredients } from '@lib/ingredients';

interface IngredientsState {
  items: Ingredient[];
}

const initialState: IngredientsState = {
  items: mockIngredients.map((ing) => ({
    ...ing,
    otherUnit: null,
    defaultProductId: null,
  })),
};

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    createIngredient: (state, action: PayloadAction<Omit<Ingredient, 'id'>>) => {
      const newIngredient: Ingredient = {
        ...action.payload,
        id: `ingredient-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
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
  },
});

export const { createIngredient, updateIngredient, deleteIngredient } =
  ingredientsSlice.actions;

export default ingredientsSlice.reducer;
