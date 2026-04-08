import type { ToolDefinition, ToolContext, ToolResult } from './tool.types';

export const getMealPlanTool: ToolDefinition = {
  name: 'get_meal_plan',
  description: 'Get planned recipes for a specific date or date range. Dates should be in YYYY-MM-DD format.',
  parameters: {
    type: 'object',
    required: [],
    properties: {
      date: {
        type: 'string',
        description: 'A specific date in YYYY-MM-DD format',
      },
      start_date: {
        type: 'string',
        description: 'Start of date range in YYYY-MM-DD format',
      },
      end_date: {
        type: 'string',
        description: 'End of date range in YYYY-MM-DD format',
      },
      category: {
        type: 'string',
        description: 'Filter by meal category',
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'],
      },
    },
  },
  requiresConfirmation: false,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    let plans = state.calendar.plannedRecipes;

    if (args.date) {
      const targetDate = new Date(String(args.date));
      targetDate.setHours(0, 0, 0, 0);
      const targetMs = targetDate.getTime();
      plans = plans.filter((p) => {
        const planDate = new Date(p.date);
        planDate.setHours(0, 0, 0, 0);
        return planDate.getTime() === targetMs;
      });
    } else if (args.start_date ?? args.end_date) {
      const startMs = args.start_date
        ? new Date(String(args.start_date)).setHours(0, 0, 0, 0)
        : 0;
      const endMs = args.end_date
        ? new Date(String(args.end_date)).setHours(23, 59, 59, 999)
        : Infinity;
      plans = plans.filter((p) => p.date >= startMs && p.date <= endMs);
    }

    if (args.category) {
      const cat = String(args.category).toLowerCase();
      plans = plans.filter((p) => p.category === cat);
    }

    const items = plans.map((p) => {
      const recipe = state.recipes.items.find((r) => r.id === p.recipeId);
      return {
        id: p.id,
        date: new Date(p.date).toISOString().split('T')[0],
        category: p.category,
        recipeName: recipe?.title ?? 'Unknown recipe',
        recipeId: p.recipeId,
        notes: p.notes,
      };
    });

    return {
      success: true,
      data: { items, total: items.length },
      displayType: 'list',
      message: items.length > 0
        ? `Found ${items.length} planned meal${items.length === 1 ? '' : 's'}.`
        : 'No meals planned for the specified dates.',
    };
  },
};

export const planRecipeTool: ToolDefinition = {
  name: 'plan_recipe',
  description: 'Add a recipe to the meal plan for a specific date and meal category.',
  parameters: {
    type: 'object',
    required: ['recipe_id', 'date', 'category'],
    properties: {
      recipe_id: {
        type: 'string',
        description: 'The ID of the recipe to plan',
      },
      date: {
        type: 'string',
        description: 'The date in YYYY-MM-DD format',
      },
      category: {
        type: 'string',
        description: 'The meal category',
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'],
      },
      notes: {
        type: 'string',
        description: 'Optional notes for the planned meal',
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
        message: 'Recipe not found. Please search for recipes first to get the correct ID.',
      };
    }

    const dateObj = new Date(String(args.date));
    dateObj.setHours(0, 0, 0, 0);

    const { createPlannedRecipe } = await import('@store/actions/calendarActions');
    await context.dispatch(createPlannedRecipe({
      recipeId: recipe.id,
      date: dateObj.getTime(),
      category: String(args.category) as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink',
      notes: args.notes ? String(args.notes) : null,
    }));

    return {
      success: true,
      data: { recipeName: recipe.title, date: String(args.date), category: args.category },
      displayType: 'success',
      message: `Planned "${recipe.title}" for ${args.category} on ${args.date}.`,
    };
  },
};

export const updatePlannedRecipeTool: ToolDefinition = {
  name: 'update_planned_recipe',
  description: 'Update a planned meal\'s date, category, or notes. Requires user confirmation.',
  parameters: {
    type: 'object',
    required: ['planned_recipe_id'],
    properties: {
      planned_recipe_id: {
        type: 'string',
        description: 'The ID of the planned recipe to update',
      },
      date: { type: 'string', description: 'New date in YYYY-MM-DD format' },
      category: {
        type: 'string',
        description: 'New meal category',
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'],
      },
      notes: { type: 'string', description: 'New notes' },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const plan = state.calendar.plannedRecipes.find((p) => p.id === args.planned_recipe_id);

    if (!plan) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Planned recipe not found.',
      };
    }

    const recipe = state.recipes.items.find((r) => r.id === plan.recipeId);
    const { planned_recipe_id: _id, ...updates } = args;
    const proposedChanges: Record<string, { current: unknown; proposed: unknown }> = {};

    if (updates.date !== undefined) {
      proposedChanges.date = {
        current: new Date(plan.date).toISOString().split('T')[0],
        proposed: updates.date,
      };
    }
    if (updates.category !== undefined) {
      proposedChanges.category = { current: plan.category, proposed: updates.category };
    }
    if (updates.notes !== undefined) {
      proposedChanges.notes = { current: plan.notes, proposed: updates.notes };
    }

    return {
      success: true,
      data: {
        entityType: 'plannedRecipe',
        entityId: plan.id,
        entityName: recipe?.title ?? 'Planned meal',
        proposedChanges,
        fullEntity: plan,
      },
      displayType: 'confirmation',
      message: `Proposed changes to planned "${recipe?.title ?? 'meal'}": ${Object.keys(proposedChanges).join(', ')}.`,
    };
  },
};

export const removePlannedRecipeTool: ToolDefinition = {
  name: 'remove_planned_recipe',
  description: 'Remove a recipe from the meal plan. Requires user confirmation.',
  parameters: {
    type: 'object',
    required: ['planned_recipe_id'],
    properties: {
      planned_recipe_id: {
        type: 'string',
        description: 'The ID of the planned recipe to remove',
      },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const plan = state.calendar.plannedRecipes.find((p) => p.id === args.planned_recipe_id);

    if (!plan) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Planned recipe not found.',
      };
    }

    const recipe = state.recipes.items.find((r) => r.id === plan.recipeId);

    return {
      success: true,
      data: {
        entityType: 'plannedRecipe',
        entityId: plan.id,
        entityName: recipe?.title ?? 'Planned meal',
        entity: { ...plan, recipeName: recipe?.title },
      },
      displayType: 'confirmation',
      message: `Remove "${recipe?.title ?? 'meal'}" from ${plan.category} on ${new Date(plan.date).toISOString().split('T')[0]}?`,
    };
  },
};

export const calendarTools: ToolDefinition[] = [
  getMealPlanTool,
  planRecipeTool,
  updatePlannedRecipeTool,
  removePlannedRecipeTool,
];
