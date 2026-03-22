import {
  getBarcodePrefillFromProduct,
  getBarcodePrefillOptions,
} from './barcodePrefill';
import type { OpenFoodFactsProduct } from '@store/api/openFoodFactsApi';

function createProduct(overrides: Partial<OpenFoodFactsProduct> = {}): OpenFoodFactsProduct {
  return {
    product_name: 'Test Product',
    serving_quantity: 30,
    serving_quantity_unit: 'g',
    serving_size: '30g',
    nutriments: {
      proteins_serving: 5,
      proteins_100g: 16.7,
      carbohydrates_serving: 20,
      carbohydrates_100g: 66.7,
      fat_serving: 3,
      fat_100g: 10,
      fiber_serving: 2,
      fiber_100g: 6.7,
      sugars_serving: 8,
      sugars_100g: 26.7,
      sodium_serving: 0.2,
      sodium_100g: 0.67,
      'energy-kcal_serving': 127,
      'energy-kcal_100g': 423,
    },
    image_url: 'https://example.com/image.jpg',
    ...overrides,
  };
}

describe('getBarcodePrefillFromProduct', () => {
  it('returns a prefill with expected fields from a product', () => {
    const product = createProduct();
    const result = getBarcodePrefillFromProduct(product, '1234567890');
    expect(result.barcode).toBe('1234567890');
    expect(result.name).toBe('Test Product');
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
    expect(result.servingSize).toBe(30);
    expect(result.unit).toBe('g');
    expect(typeof result.protein).toBe('number');
    expect(typeof result.calories).toBe('number');
  });

  it('returns fallback values for null/undefined product', () => {
    const result = getBarcodePrefillFromProduct(null, null);
    expect(result.barcode).toBeNull();
    expect(result.name).toBe('');
    expect(result.servingSize).toBe(100);
    expect(result.unit).toBe('g');
  });

  it('handles product with missing nutriments', () => {
    const product = createProduct({ nutriments: undefined });
    const result = getBarcodePrefillFromProduct(product, '123');
    expect(result.protein).toBe(0);
    expect(result.calories).toBe(0);
  });
});

describe('getBarcodePrefillOptions', () => {
  it('returns options array with at least one option', () => {
    const product = createProduct();
    const result = getBarcodePrefillOptions(product, '123');
    expect(result.options.length).toBeGreaterThanOrEqual(1);
    expect(result.defaultOptionId).toBeTruthy();
  });

  it('returns a fallback option when no serving info is available', () => {
    const product = createProduct({
      serving_quantity: undefined,
      serving_quantity_unit: undefined,
      serving_size: undefined,
      serving_size_imported: undefined,
    });
    const result = getBarcodePrefillOptions(product, '123');
    expect(result.options.length).toBeGreaterThanOrEqual(1);
    const defaultOption = result.options.find((o) => o.id === result.defaultOptionId);
    expect(defaultOption).toBeDefined();
    expect(defaultOption!.prefill.servingSize).toBe(100);
    expect(defaultOption!.prefill.unit).toBe('g');
  });

  it('includes description for each option', () => {
    const product = createProduct();
    const result = getBarcodePrefillOptions(product, '123');
    result.options.forEach((option) => {
      expect(option.description).toBeTruthy();
      expect(option.label).toBeTruthy();
    });
  });

  it('deduplicates identical serving info candidates', () => {
    const product = createProduct({
      serving_quantity: 30,
      serving_quantity_unit: 'g',
      serving_size: '30g',
      serving_size_imported: '30g',
    });
    const result = getBarcodePrefillOptions(product, '123');
    const servingSizes = result.options.map(
      (o) => `${o.prefill.servingSize}|${o.prefill.unit}`,
    );
    const uniqueSizes = new Set(servingSizes);
    expect(uniqueSizes.size).toBe(servingSizes.length);
  });
});
