import { render, screen, fireEvent } from '@testing-library/react';
import { IngredientCard } from './IngredientCard';
import type { Ingredient } from '@lib/ingredients';

function createIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing-1',
    userId: 'user-1',
    name: 'Chicken Breast',
    type: 'meat',
    imageUrl: 'https://example.com/chicken.jpg',
    nutrients: { protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, calories: 165 },
    currentAmount: 500,
    servingSize: 100,
    unit: 'g',
    otherUnit: null,
    products: [],
    defaultProductId: null,
    barcode: null,
    ...overrides,
  };
}

describe('IngredientCard', () => {
  it('renders the ingredient name', () => {
    const ingredient = createIngredient();
    render(<IngredientCard ingredient={ingredient} onClick={jest.fn()} />);
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
  });

  it('renders the ingredient type badge', () => {
    const ingredient = createIngredient();
    render(<IngredientCard ingredient={ingredient} onClick={jest.fn()} />);
    expect(screen.getByText('meat')).toBeInTheDocument();
  });

  it('displays servings count based on currentAmount and servingSize', () => {
    const ingredient = createIngredient({ currentAmount: 500, servingSize: 100 });
    render(<IngredientCard ingredient={ingredient} onClick={jest.fn()} />);
    expect(screen.getByText('5 servings')).toBeInTheDocument();
  });

  it('displays serving size label', () => {
    const ingredient = createIngredient({ servingSize: 100, unit: 'g' });
    render(<IngredientCard ingredient={ingredient} onClick={jest.fn()} />);
    expect(screen.getByText('100 g')).toBeInTheDocument();
  });

  it('displays 0 servings when servingSize is 0', () => {
    const ingredient = createIngredient({ servingSize: 0 });
    render(<IngredientCard ingredient={ingredient} onClick={jest.fn()} />);
    expect(screen.getByText('0 servings')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    const ingredient = createIngredient();
    render(<IngredientCard ingredient={ingredient} onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    const onClick = jest.fn();
    const ingredient = createIngredient();
    render(<IngredientCard ingredient={ingredient} onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the ingredient image', () => {
    const ingredient = createIngredient({ imageUrl: 'https://example.com/img.jpg' });
    render(<IngredientCard ingredient={ingredient} onClick={jest.fn()} />);
    const img = screen.getByAltText('Chicken Breast');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('renders the type emoji', () => {
    const ingredient = createIngredient({ type: 'produce' });
    render(<IngredientCard ingredient={ingredient} onClick={jest.fn()} />);
    expect(screen.getByText('🥬')).toBeInTheDocument();
  });
});
