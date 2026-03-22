import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ShoppingListItem } from '@lib/shoppingList';
import { generatedId } from '@utils/generatedId';
import {
  fetchShoppingList,
  createShoppingListItem as createShoppingListItemAsync,
  updateShoppingListItem as updateShoppingListItemAsync,
  deleteShoppingListItem as deleteShoppingListItemAsync,
  clearCheckedShoppingListItems as clearCheckedShoppingListItemsAsync,
} from '@store/actions/shoppingListActions';

interface ShoppingListState {
  items: ShoppingListItem[];
}

const initialState: ShoppingListState = {
  items: [],
};

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    addShoppingListItem: (
      state,
      action: PayloadAction<Omit<ShoppingListItem, 'id' | 'createdAt'> & { id?: string; createdAt?: number }>
    ) => {
      const { id: presetId, createdAt: presetCreatedAt, ...rest } = action.payload;
      const newItem: ShoppingListItem = {
        ...rest,
        id: presetId ?? generatedId('sl'),
        createdAt: presetCreatedAt ?? Date.now(),
      };

      state.items.push(newItem);
    },
    updateShoppingListItem: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<ShoppingListItem, 'id'>> }>
    ) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);

      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    toggleShoppingListItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);

      if (item) {
        item.checked = !item.checked;
      }
    },
    deleteShoppingListItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCheckedItems: (state) => {
      state.items = state.items.filter((item) => !item.checked);
    },
    setShoppingList: (state, action: PayloadAction<ShoppingListItem[]>) => {
      state.items = action.payload;
    },
    resetShoppingList: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShoppingList.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createShoppingListItemAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateShoppingListItemAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteShoppingListItemAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(clearCheckedShoppingListItemsAsync.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload);
        state.items = state.items.filter((item) => !deletedIds.has(item.id));
      });
  },
});

export const {
  addShoppingListItem,
  updateShoppingListItem,
  toggleShoppingListItem,
  deleteShoppingListItem,
  clearCheckedItems,
  setShoppingList,
  resetShoppingList,
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;
