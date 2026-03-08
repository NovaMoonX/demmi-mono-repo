import type { IngredientType, MeasurementUnit } from '@lib/ingredients';

export interface ShoppingListItem {
  id: string;
  // For simple text items, name holds the text. For ingredient-linked items it
  // holds the ingredient name (or a custom override).
  name: string;
  // Optional link to a stored ingredient
  ingredientId: string | null;
  // Optional link to a specific product of that ingredient
  productId: string | null;
  // Quantity in `unit` units
  amount: number | null;
  unit: MeasurementUnit | null;
  // Category used for grouping (falls back to 'other' for plain-text items)
  category: IngredientType | 'other';
  // Optional free-text note
  note: string | null;
  // Whether the item has been ticked off
  checked: boolean;
  // Creation timestamp (ms)
  createdAt: number;
}
