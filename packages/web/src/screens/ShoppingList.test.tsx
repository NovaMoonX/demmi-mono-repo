import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { ShoppingList } from './ShoppingList';
import type { ShoppingListItem } from '@lib/shoppingList';

vi.mock('@components/shopping', () => ({
  ItemRow: ({ item, onToggle, onEdit, onDelete }: {
    item: ShoppingListItem;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
  }) => (
    <div data-testid={`item-row-${item.id}`}>
      <span>{item.name}</span>
      <button data-testid={`toggle-${item.id}`} onClick={onToggle}>Toggle</button>
      <button data-testid={`edit-${item.id}`} onClick={onEdit}>Edit</button>
      <button data-testid={`delete-${item.id}`} onClick={onDelete}>Delete</button>
    </div>
  ),
  ItemFormModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="item-form-modal">Form Modal</div> : null,
  emptyForm: () => ({
    name: '', ingredientId: null, productId: null,
    amount: '', unit: '', category: 'other', note: '',
  }),
  itemToForm: (item: ShoppingListItem) => ({
    name: item.name, ingredientId: item.ingredientId, productId: item.productId,
    amount: item.amount !== null ? String(item.amount) : '', unit: item.unit ?? '',
    category: item.category, note: item.note ?? '',
  }),
}));

function createItem(overrides: Partial<ShoppingListItem> = {}): ShoppingListItem {
  return {
    id: 'sl-1',
    userId: 'user-1',
    name: 'Milk',
    ingredientId: null,
    productId: null,
    amount: 2,
    unit: 'l',
    category: 'dairy',
    note: null,
    checked: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

const mockItems: ShoppingListItem[] = [
  createItem({ id: 'sl-1', name: 'Milk', category: 'dairy', checked: false }),
  createItem({ id: 'sl-2', name: 'Bread', category: 'grains', checked: true }),
  createItem({ id: 'sl-3', name: 'Chicken', category: 'meat', checked: false }),
];

describe('ShoppingList Screen', () => {
  it('renders the shopping list title', () => {
    renderWithProviders(<ShoppingList />, {
      preloadedState: { shoppingList: { items: [] } },
    });
    expect(screen.getByText(/Shopping List/)).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    renderWithProviders(<ShoppingList />, {
      preloadedState: { shoppingList: { items: [] } },
    });
    expect(screen.getByText('Your list is empty')).toBeInTheDocument();
  });

  it('renders item rows for each shopping list item', () => {
    renderWithProviders(<ShoppingList />, {
      preloadedState: { shoppingList: { items: mockItems } },
    });
    expect(screen.getByTestId('item-row-sl-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-row-sl-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-row-sl-3')).toBeInTheDocument();
  });

  it('displays checked count', () => {
    renderWithProviders(<ShoppingList />, {
      preloadedState: { shoppingList: { items: mockItems } },
    });
    expect(screen.getByText('1/3 items checked')).toBeInTheDocument();
  });

  it('opens add modal when Add item button is clicked', () => {
    renderWithProviders(<ShoppingList />, {
      preloadedState: { shoppingList: { items: mockItems } },
    });

    fireEvent.click(screen.getByText('+ Add item'));
    expect(screen.getByTestId('item-form-modal')).toBeInTheDocument();
  });

  it('shows clear checked button when items are checked', () => {
    renderWithProviders(<ShoppingList />, {
      preloadedState: { shoppingList: { items: mockItems } },
    });
    expect(screen.getByText('Clear checked')).toBeInTheDocument();
  });

  it('does not show clear checked button when no items are checked', () => {
    const uncheckedItems = mockItems.map((item) => ({ ...item, checked: false }));
    renderWithProviders(<ShoppingList />, {
      preloadedState: { shoppingList: { items: uncheckedItems } },
    });
    expect(screen.queryByText('Clear checked')).not.toBeInTheDocument();
  });
});
