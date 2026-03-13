import { MEAL_CATEGORIES } from '@lib/meals';
import { INGREDIENT_TYPES, MEASUREMENT_UNITS } from '@lib/ingredients';

export const MEAL_NAME_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      description: 'The specific name of the meal (1–4 words, proper capitalization)',
    },
  },
};

export const MEAL_INFO_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['category', 'servings', 'totalTime'],
  properties: {
    category: {
      type: 'string',
      enum: MEAL_CATEGORIES,
      description: 'The meal category',
    },
    servings: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
      description: 'Number of servings this recipe makes',
    },
    totalTime: {
      type: 'integer',
      minimum: 1,
      description: 'Total time in minutes (prep + cook)',
    },
  },
};

export const MEAL_DESCRIPTION_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['description'],
  properties: {
    description: {
      type: 'string',
      description: 'A 1–2 sentence appetizing description of the meal',
    },
  },
};

export const MEAL_INGREDIENTS_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['ingredients'],
  properties: {
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'type', 'unit', 'servings'],
        properties: {
          name: { type: 'string', description: 'Ingredient name' },
          type: {
            type: 'string',
            enum: INGREDIENT_TYPES,
            description: 'Ingredient category',
          },
          unit: {
            type: 'string',
            enum: MEASUREMENT_UNITS,
            description: 'Measurement unit',
          },
          servings: {
            type: 'number',
            minimum: 0,
            description: 'Quantity in the specified unit',
          },
        },
      },
      description: 'List of ingredients with amounts',
    },
  },
};

export const MEAL_INSTRUCTIONS_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['steps'],
  properties: {
    steps: {
      type: 'array',
      items: { type: 'string' },
      description: 'Ordered list of cooking steps',
    },
  },
};
