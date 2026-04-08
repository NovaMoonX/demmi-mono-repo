import type { ToolDefinition, ToolContext, ToolResult } from './tool.types';
import type { Ingredient } from '@lib/ingredients';
import { createIngredient } from '@store/actions/ingredientActions';

export const searchIngredientsTool: ToolDefinition = {
  name: 'search_ingredients',
  description: 'Search the user\'s pantry ingredients by name or type.',
  parameters: {
    type: 'object',
    required: [],
    properties: {
      query: {
        type: 'string',
        description: 'Text to search for in ingredient names',
      },
      type: {
        type: 'string',
        description: 'Filter by ingredient type',
        enum: ['meat', 'produce', 'dairy', 'grains', 'legumes', 'oils', 'spices', 'nuts', 'seafood', 'other'],
      },
    },
  },
  requiresConfirmation: false,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    let ingredients = state.ingredients.items;

    if (args.query) {
      const q = String(args.query).toLowerCase();
      ingredients = ingredients.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (args.type) {
      const t = String(args.type).toLowerCase();
      ingredients = ingredients.filter((i) => i.type === t);
    }

    const items = ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      type: i.type,
      currentAmount: i.currentAmount,
      unit: i.unit,
      otherUnit: i.otherUnit,
    }));

    return {
      success: true,
      data: { items, total: items.length },
      displayType: 'list',
      message: items.length > 0
        ? `Found ${items.length} ingredient${items.length === 1 ? '' : 's'} in your pantry.`
        : 'No ingredients found matching your criteria.',
    };
  },
};

export const getIngredientTool: ToolDefinition = {
  name: 'get_ingredient',
  description: 'Get full details of a specific ingredient by its ID.',
  parameters: {
    type: 'object',
    required: ['ingredient_id'],
    properties: {
      ingredient_id: {
        type: 'string',
        description: 'The ID of the ingredient to retrieve',
      },
    },
  },
  requiresConfirmation: false,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const ingredient = state.ingredients.items.find((i) => i.id === args.ingredient_id);

    if (!ingredient) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Ingredient not found.',
      };
    }

    return {
      success: true,
      data: ingredient,
      displayType: 'text',
      message: `Ingredient: ${ingredient.name} (${ingredient.type}), ${ingredient.currentAmount} ${ingredient.unit}`,
    };
  },
};

export const updateIngredientTool: ToolDefinition = {
  name: 'update_ingredient',
  description: 'Update an ingredient\'s details. Generates a proposal that the user must confirm.',
  parameters: {
    type: 'object',
    required: ['ingredient_id'],
    properties: {
      ingredient_id: {
        type: 'string',
        description: 'The ID of the ingredient to update',
      },
      name: { type: 'string', description: 'New name' },
      type: {
        type: 'string',
        description: 'New ingredient type',
        enum: ['meat', 'produce', 'dairy', 'grains', 'legumes', 'oils', 'spices', 'nuts', 'seafood', 'other'],
      },
      currentAmount: { type: 'number', description: 'New current amount' },
      unit: {
        type: 'string',
        description: 'New measurement unit',
        enum: ['lb', 'oz', 'kg', 'g', 'cup', 'tbsp', 'tsp', 'piece', 'ml', 'l', 'other'],
      },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const ingredient = state.ingredients.items.find((i) => i.id === args.ingredient_id);

    if (!ingredient) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Ingredient not found.',
      };
    }

    const { ingredient_id: _id, ...updates } = args;
    const proposedChanges: Record<string, { current: unknown; proposed: unknown }> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key in ingredient) {
        proposedChanges[key] = {
          current: ingredient[key as keyof Ingredient],
          proposed: value,
        };
      }
    }

    return {
      success: true,
      data: {
        entityType: 'ingredient',
        entityId: ingredient.id,
        entityName: ingredient.name,
        proposedChanges,
        fullEntity: ingredient,
      },
      displayType: 'confirmation',
      message: `Proposed changes to "${ingredient.name}": ${Object.keys(proposedChanges).join(', ')}.`,
    };
  },
};

export const deleteIngredientTool: ToolDefinition = {
  name: 'delete_ingredient',
  description: 'Delete an ingredient from the pantry. Requires user confirmation.',
  parameters: {
    type: 'object',
    required: ['ingredient_id'],
    properties: {
      ingredient_id: {
        type: 'string',
        description: 'The ID of the ingredient to delete',
      },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const ingredient = state.ingredients.items.find((i) => i.id === args.ingredient_id);

    if (!ingredient) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Ingredient not found.',
      };
    }

    return {
      success: true,
      data: {
        entityType: 'ingredient',
        entityId: ingredient.id,
        entityName: ingredient.name,
        entity: ingredient,
      },
      displayType: 'confirmation',
      message: `Are you sure you want to delete "${ingredient.name}" from your pantry?`,
    };
  },
};

export const createIngredientTool: ToolDefinition = {
  name: 'create_ingredient',
  description: 'Add a new ingredient to the user\'s pantry with the given details.',
  parameters: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: { type: 'string', description: 'Ingredient name' },
      type: {
        type: 'string',
        description: 'Ingredient type/category',
        enum: ['meat', 'produce', 'dairy', 'grains', 'legumes', 'oils', 'spices', 'nuts', 'seafood', 'other'],
      },
      currentAmount: { type: 'number', description: 'Current amount on hand' },
      servingSize: { type: 'number', description: 'Portion size per serving' },
      unit: {
        type: 'string',
        description: 'Measurement unit',
        enum: ['lb', 'oz', 'kg', 'g', 'cup', 'tbsp', 'tsp', 'piece', 'ml', 'l', 'other'],
      },
    },
  },
  requiresConfirmation: false,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const name = String(args.name ?? '');
    const type = String(args.type ?? 'other') as Ingredient['type'];
    const currentAmount = Number(args.currentAmount) || 0;
    const servingSize = Number(args.servingSize) || 1;
    const unit = String(args.unit ?? 'piece') as Ingredient['unit'];

    if (!name.trim()) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Ingredient name is required.',
      };
    }

    try {
      const ingredientData: Omit<Ingredient, 'id' | 'userId'> = {
        name,
        type,
        imageUrl: '',
        nutrients: {
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          calories: 0,
        },
        currentAmount,
        servingSize,
        unit,
        otherUnit: null,
        products: [],
        defaultProductId: null,
        barcode: null,
      };

      const result = await context.dispatch(createIngredient(ingredientData));

      if (createIngredient.fulfilled.match(result)) {
        const newIngredient = result.payload;
        return {
          success: true,
          data: newIngredient,
          displayType: 'success',
          message: `Ingredient "${newIngredient.name}" added to your pantry.`,
        };
      }

      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Failed to add ingredient.',
      };
    } catch (err) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: `Failed to add ingredient: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  },
};

export const ingredientTools: ToolDefinition[] = [
  searchIngredientsTool,
  getIngredientTool,
  createIngredientTool,
  updateIngredientTool,
  deleteIngredientTool,
];
