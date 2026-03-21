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

export const MEAL_FIELD_DETECTION_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['shouldUpdate', 'reason'],
  properties: {
    shouldUpdate: {
      type: 'boolean',
      description: 'Whether this specific recipe field needs to be regenerated',
    },
    reason: {
      type: 'string',
      description:
        'Concise explanation of why this field should or should not change, including specifics about what would change (e.g. serving size from 4 to 8, lemon removed from ingredients)',
    },
  },
};

export const MEAL_ITERATION_SUMMARY_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['summary'],
  properties: {
    summary: {
      type: 'string',
      description: 'Very brief, friendly 1-sentence summary of what was changed in the recipe',
    },
  },
};

export const MEAL_ITERATION_VALIDATION_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['valid', 'agentMessage'],
  properties: {
    valid: {
      type: 'boolean',
      description: 'Whether the user message is asking to refine/modify the current recipe',
    },
    agentMessage: {
      type: 'string',
      description: 'Friendly agent acknowledgment (valid) or clarification request (invalid)',
    },
  },
};
