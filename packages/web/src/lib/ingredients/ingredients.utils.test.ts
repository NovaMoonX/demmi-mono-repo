import { getPricePerServing } from './ingredients.utils';
import type { Ingredient, Product } from './ingredients.types';

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    retailer: 'Store',
    label: 'Product',
    cost: 10,
    servings: 5,
    url: null,
    ...overrides,
  };
}

function createIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing-1',
    userId: 'user-1',
    name: 'Test Ingredient',
    type: 'produce',
    imageUrl: '',
    nutrients: { protein: 5, carbs: 10, fat: 3, fiber: 2, sugar: 1, sodium: 100, calories: 85 },
    currentAmount: 500,
    servingSize: 100,
    unit: 'g',
    otherUnit: null,
    products: [createProduct()],
    defaultProductId: null,
    barcode: null,
    ...overrides,
  };
}

describe('getPricePerServing', () => {
  it('calculates price per serving from the first product', () => {
    const ingredient = createIngredient({
      products: [createProduct({ cost: 10, servings: 5 })],
    });
    const result = getPricePerServing(ingredient);
    expect(result).toBe(2);
  });

  it('uses the default product when defaultProductId is set', () => {
    const ingredient = createIngredient({
      defaultProductId: 'prod-2',
      products: [
        createProduct({ id: 'prod-1', cost: 10, servings: 5 }),
        createProduct({ id: 'prod-2', cost: 15, servings: 3 }),
      ],
    });
    const result = getPricePerServing(ingredient);
    expect(result).toBe(5);
  });

  it('falls back to first product if defaultProductId does not match', () => {
    const ingredient = createIngredient({
      defaultProductId: 'nonexistent',
      products: [createProduct({ cost: 12, servings: 4 })],
    });
    const result = getPricePerServing(ingredient);
    expect(result).toBe(3);
  });

  it('returns 0 when there are no products', () => {
    const ingredient = createIngredient({ products: [] });
    const result = getPricePerServing(ingredient);
    expect(result).toBe(0);
  });

  it('returns 0 when product has zero servings', () => {
    const ingredient = createIngredient({
      products: [createProduct({ cost: 10, servings: 0 })],
    });
    const result = getPricePerServing(ingredient);
    expect(result).toBe(0);
  });
});
