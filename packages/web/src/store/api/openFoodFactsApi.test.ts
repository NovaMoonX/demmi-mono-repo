import { describe, it, expect } from 'vitest';
import { openFoodFactsApi, useLazyGetProductByBarcodeQuery } from './openFoodFactsApi';

describe('openFoodFactsApi', () => {
  it('exports the API slice', () => {
    expect(openFoodFactsApi).toBeDefined();
    expect(openFoodFactsApi.reducerPath).toBe('openFoodFactsApi');
  });

  it('has a reducer', () => {
    expect(typeof openFoodFactsApi.reducer).toBe('function');
  });

  it('has middleware', () => {
    expect(typeof openFoodFactsApi.middleware).toBe('function');
  });

  it('exports useLazyGetProductByBarcodeQuery', () => {
    expect(useLazyGetProductByBarcodeQuery).toBeDefined();
    expect(typeof useLazyGetProductByBarcodeQuery).toBe('function');
  });

  it('has getProductByBarcode endpoint', () => {
    expect(openFoodFactsApi.endpoints).toHaveProperty('getProductByBarcode');
  });
});
