import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface OpenFoodFactsProduct {
  product_name?: string;
  serving_quantity?: number;
  serving_quantity_unit?: string;
  serving_size?: string;
  serving_size_imported?: string;
  nutriments?: {
    proteins_serving?: number;
    proteins_100g?: number;
    carbohydrates_serving?: number;
    carbohydrates_100g?: number;
    fat_serving?: number;
    fat_100g?: number;
    fiber_serving?: number;
    fiber_100g?: number;
    sugars_serving?: number;
    sugars_100g?: number;
    sodium_serving?: number;
    sodium_100g?: number;
    'energy-kcal_serving'?: number;
    'energy-kcal_100g'?: number;
  };
  image_url?: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

export const openFoodFactsApi = createApi({
  reducerPath: 'openFoodFactsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://world.openfoodfacts.org/api/v0/',
  }),
  endpoints: (builder) => ({
    getProductByBarcode: builder.query<OpenFoodFactsResponse, string>({
      query: (barcode) => `product/${barcode}.json`,
    }),
  }),
});

export const { useLazyGetProductByBarcodeQuery } = openFoodFactsApi;
