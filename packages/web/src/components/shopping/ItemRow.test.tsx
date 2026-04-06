import type { Ingredient, Product } from '@lib/ingredients';
import type { ShoppingListItem } from '@lib/shoppingList';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { ItemRow } from './ItemRow';

function createItem(
  overrides: Partial<ShoppingListItem> = {},
): ShoppingListItem {
  return {
    id: 'sl-1',
    userId: 'user-1',
    name: 'Bananas',
    ingredientId: null,
    productId: null,
    amount: null,
    unit: null,
    category: 'produce',
    note: null,
    checked: false,
    createdAt: 1700000000000,
    ...overrides,
  };
}

function createIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing-1',
    userId: 'user-1',
    name: 'Bananas',
    type: 'produce',
    imageUrl: '',
    nutrients: {
      protein: 1,
      carbs: 23,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12,
      sodium: 1,
      calories: 89,
    },
    currentAmount: 6,
    servingSize: 1,
    unit: 'piece',
    otherUnit: null,
    products: [
      mock<Product>({
        id: 'prod-1',
        retailer: 'Walmart',
        label: 'Organic Bananas',
        cost: 1.99,
        url: null,
      }),
    ],
    defaultProductId: 'prod-1',
    barcode: null,
    ...overrides,
  };
}

describe('ItemRow', () => {
  const defaultProps = {
    item: createItem(),
    ingredients: [] as Ingredient[],
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the item name', () => {
    render(<ItemRow {...defaultProps} />);
    expect(screen.getByText('Bananas')).toBeInTheDocument();
  });

  it('renders Edit and Delete buttons', () => {
    render(<ItemRow {...defaultProps} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    render(<ItemRow {...defaultProps} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when Delete button is clicked', () => {
    render(<ItemRow {...defaultProps} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders amount and unit when provided', () => {
    const item = createItem({ amount: 2, unit: 'lb' });
    render(<ItemRow {...defaultProps} item={item} />);
    expect(screen.getByText('2 lb')).toBeInTheDocument();
  });

  it('does not render amount when amount is null', () => {
    render(<ItemRow {...defaultProps} />);
    expect(screen.queryByText(/lb|oz|kg|g/)).not.toBeInTheDocument();
  });

  it('renders a note when provided', () => {
    const item = createItem({ note: 'Get ripe ones' });
    render(<ItemRow {...defaultProps} item={item} />);
    expect(screen.getByText('Get ripe ones')).toBeInTheDocument();
  });

  it('renders product info when ingredient and product match', () => {
    const ingredient = createIngredient();
    const item = createItem({ ingredientId: 'ing-1', productId: 'prod-1' });
    render(
      <ItemRow {...defaultProps} item={item} ingredients={[ingredient]} />,
    );
    expect(screen.getByText(/Walmart/)).toBeInTheDocument();
    expect(screen.getByText(/Organic Bananas/)).toBeInTheDocument();
  });

  it('applies line-through style when item is checked', () => {
    const item = createItem({ checked: true });
    render(<ItemRow {...defaultProps} item={item} />);
    const nameEl = screen.getByText('Bananas');
    expect(nameEl.className).toContain('line-through');
  });

  it('does not apply line-through style when item is unchecked', () => {
    render(<ItemRow {...defaultProps} />);
    const nameEl = screen.getByText('Bananas');
    expect(nameEl.className).not.toContain('line-through');
  });

  it('shows "Pantry updated" text when pantryUpdated is true', () => {
    render(<ItemRow {...defaultProps} pantryUpdated={true} />);
    expect(screen.getByText('✓ Pantry updated')).toBeInTheDocument();
  });

  it('does not show "Pantry updated" text by default', () => {
    render(<ItemRow {...defaultProps} />);
    expect(screen.queryByText('✓ Pantry updated')).not.toBeInTheDocument();
  });
});
