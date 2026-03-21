export type IngredientType = 
  | 'meat' 
  | 'produce' 
  | 'dairy' 
  | 'grains' 
  | 'legumes' 
  | 'oils' 
  | 'spices' 
  | 'nuts' 
  | 'seafood' 
  | 'other';

export type MeasurementUnit = 
  | 'lb' 
  | 'oz' 
  | 'kg' 
  | 'g' 
  | 'cup' 
  | 'tbsp' 
  | 'tsp' 
  | 'piece' 
  | 'ml'
  | 'l'
  | 'other';

export interface NutrientProfile {
  // Macros (per serving)
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  // Additional nutrients
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // milligrams
  calories: number; // kcal
}

export interface Product {
  id: string;
  retailer: string;
  label: string;
  cost: number; // in dollars
  servings: number; // number of servings in this product
  url: string | null; // optional URL to the product
}

export interface Ingredient {
  id: string;
  userId: string;
  name: string;
  type: IngredientType;
  imageUrl: string;
  nutrients: NutrientProfile;
  currentAmount: number;
  servingSize: number; // portion size in the same unit as `unit`
  unit: MeasurementUnit;
  otherUnit: string | null; // For custom units if 'other' is selected
  products: Product[]; // associated products/retailers for this ingredient
  defaultProductId: string | null; // ID of the default product
  barcode: string | null; // product barcode (e.g. EAN-13 / UPC)
}
