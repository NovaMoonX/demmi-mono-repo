import type { ShoppingListItem } from '@lib/shoppingList';
import type { ItemFormState } from './ItemFormModal';

export function emptyForm(): ItemFormState {
  return {
    name: '',
    ingredientId: null,
    productId: null,
    amount: '',
    unit: '',
    category: 'other',
    note: '',
  };
}

export function itemToForm(item: ShoppingListItem): ItemFormState {
  return {
    name: item.name,
    ingredientId: item.ingredientId,
    productId: item.productId,
    amount: item.amount !== null ? String(item.amount) : '',
    unit: item.unit ?? '',
    category: item.category,
    note: item.note ?? '',
  };
}
