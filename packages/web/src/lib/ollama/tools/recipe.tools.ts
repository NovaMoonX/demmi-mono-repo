import type { ToolDefinition, ToolContext, ToolResult } from './tool.types';
import type { Recipe } from '@lib/recipes';

export const searchRecipesTool: ToolDefinition = {
  name: 'search_recipes',
  description: 'Search the user\'s saved recipes by name, category, or cuisine. Returns a list of matching recipes.',
  parameters: {
    type: 'object',
    required: [],
    properties: {
      query: {
        type: 'string',
        description: 'Text to search for in recipe titles',
      },
      category: {
        type: 'string',
        description: 'Filter by meal category',
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'],
      },
      cuisine: {
        type: 'string',
        description: 'Filter by cuisine type (e.g. italian, mexican, chinese)',
      },
    },
  },
  requiresConfirmation: false,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    let recipes = state.recipes.items;

    if (args.query) {
      const q = String(args.query).toLowerCase();
      recipes = recipes.filter((r) => r.title.toLowerCase().includes(q));
    }
    if (args.category) {
      const cat = String(args.category).toLowerCase();
      recipes = recipes.filter((r) => r.category === cat);
    }
    if (args.cuisine) {
      const cuis = String(args.cuisine).toLowerCase();
      recipes = recipes.filter((r) => r.cuisine.toLowerCase() === cuis);
    }

    const items = recipes.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      cuisine: r.cuisine,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      servingSize: r.servingSize,
    }));

    return {
      success: true,
      data: { items, total: items.length },
      displayType: 'list',
      message: items.length > 0
        ? `Found ${items.length} recipe${items.length === 1 ? '' : 's'}.`
        : 'No recipes found matching your criteria.',
    };
  },
};

export const getRecipeTool: ToolDefinition = {
  name: 'get_recipe',
  description: 'Get full details of a specific recipe by its ID.',
  parameters: {
    type: 'object',
    required: ['recipe_id'],
    properties: {
      recipe_id: {
        type: 'string',
        description: 'The ID of the recipe to retrieve',
      },
    },
  },
  requiresConfirmation: false,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const recipe = state.recipes.items.find((r) => r.id === args.recipe_id);

    if (!recipe) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Recipe not found.',
      };
    }

    const ingredients = recipe.ingredients.map((ri) => {
      const ingredient = state.ingredients.items.find((i) => i.id === ri.ingredientId);
      return {
        name: ingredient?.name ?? 'Unknown',
        servings: ri.servings,
        unit: ingredient?.unit ?? 'piece',
      };
    });

    return {
      success: true,
      data: { ...recipe, resolvedIngredients: ingredients },
      displayType: 'text',
      message: `Recipe: ${recipe.title} (${recipe.category}, ${recipe.cuisine})`,
    };
  },
};

export const updateRecipeTool: ToolDefinition = {
  name: 'update_recipe',
  description: 'Update a recipe\'s details. Generates a proposal that the user must confirm before applying.',
  parameters: {
    type: 'object',
    required: ['recipe_id'],
    properties: {
      recipe_id: {
        type: 'string',
        description: 'The ID of the recipe to update',
      },
      title: { type: 'string', description: 'New title for the recipe' },
      description: { type: 'string', description: 'New description' },
      category: {
        type: 'string',
        description: 'New meal category',
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'],
      },
      cuisine: { type: 'string', description: 'New cuisine type' },
      prepTime: { type: 'number', description: 'New prep time in minutes' },
      cookTime: { type: 'number', description: 'New cook time in minutes' },
      servingSize: { type: 'number', description: 'New serving size' },
      instructions: {
        type: 'array',
        description: 'New step-by-step instructions',
        items: { type: 'string' },
      },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const recipe = state.recipes.items.find((r) => r.id === args.recipe_id);

    if (!recipe) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Recipe not found.',
      };
    }

    const { recipe_id: _id, ...updates } = args;
    const proposedChanges: Record<string, { current: unknown; proposed: unknown }> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key in recipe) {
        proposedChanges[key] = {
          current: recipe[key as keyof Recipe],
          proposed: value,
        };
      }
    }

    return {
      success: true,
      data: {
        entityType: 'recipe',
        entityId: recipe.id,
        entityName: recipe.title,
        proposedChanges,
        fullEntity: recipe,
      },
      displayType: 'confirmation',
      message: `Proposed changes to "${recipe.title}": ${Object.keys(proposedChanges).join(', ')}.`,
    };
  },
};

export const deleteRecipeTool: ToolDefinition = {
  name: 'delete_recipe',
  description: 'Delete a recipe. Requires user confirmation before proceeding.',
  parameters: {
    type: 'object',
    required: ['recipe_id'],
    properties: {
      recipe_id: {
        type: 'string',
        description: 'The ID of the recipe to delete',
      },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const recipe = state.recipes.items.find((r) => r.id === args.recipe_id);

    if (!recipe) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Recipe not found.',
      };
    }

    return {
      success: true,
      data: {
        entityType: 'recipe',
        entityId: recipe.id,
        entityName: recipe.title,
        entity: recipe,
      },
      displayType: 'confirmation',
      message: `Are you sure you want to delete "${recipe.title}"?`,
    };
  },
};

export const recipeTools: ToolDefinition[] = [
  searchRecipesTool,
  getRecipeTool,
  updateRecipeTool,
  deleteRecipeTool,
];
