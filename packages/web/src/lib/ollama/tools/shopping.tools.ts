import type { ToolDefinition, ToolContext, ToolResult } from './tool.types';

export const getShoppingListTool: ToolDefinition = {
  name: 'get_shopping_list',
  description: 'Get the user\'s shopping list items, optionally filtered by checked status.',
  parameters: {
    type: 'object',
    required: [],
    properties: {
      checked: {
        type: 'string',
        description: 'Filter by checked status: "true" for checked, "false" for unchecked, omit for all',
        enum: ['true', 'false'],
      },
      category: {
        type: 'string',
        description: 'Filter by ingredient category',
        enum: ['meat', 'produce', 'dairy', 'grains', 'legumes', 'oils', 'spices', 'nuts', 'seafood', 'other'],
      },
    },
  },
  requiresConfirmation: false,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    let items = state.shoppingList.items;

    if (args.checked !== undefined) {
      const isChecked = String(args.checked) === 'true';
      items = items.filter((i) => i.checked === isChecked);
    }
    if (args.category) {
      const cat = String(args.category).toLowerCase();
      items = items.filter((i) => i.category === cat);
    }

    const listItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      amount: i.amount,
      unit: i.unit,
      category: i.category,
      checked: i.checked,
      note: i.note,
    }));

    return {
      success: true,
      data: { items: listItems, total: listItems.length },
      displayType: 'list',
      message: listItems.length > 0
        ? `Shopping list has ${listItems.length} item${listItems.length === 1 ? '' : 's'}.`
        : 'Shopping list is empty.',
    };
  },
};

export const addToShoppingListTool: ToolDefinition = {
  name: 'add_to_shopping_list',
  description: 'Add one or more items to the shopping list.',
  parameters: {
    type: 'object',
    required: ['items'],
    properties: {
      items: {
        type: 'array',
        description: 'Array of item names to add to the shopping list',
        items: { type: 'string' },
      },
    },
  },
  requiresConfirmation: false,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const itemNames = args.items as string[];
    if (!Array.isArray(itemNames) || itemNames.length === 0) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Please provide at least one item to add.',
      };
    }

    const { createShoppingListItem } = await import('@store/actions/shoppingListActions');

    for (const name of itemNames) {
      await context.dispatch(createShoppingListItem({
        name: String(name),
        ingredientId: null,
        productId: null,
        amount: null,
        unit: null,
        category: 'other',
        note: null,
        checked: false,
      }));
    }

    return {
      success: true,
      data: { addedItems: itemNames, count: itemNames.length },
      displayType: 'success',
      message: `Added ${itemNames.length} item${itemNames.length === 1 ? '' : 's'} to the shopping list.`,
    };
  },
};

export const checkShoppingItemsTool: ToolDefinition = {
  name: 'check_shopping_items',
  description: 'Mark shopping list items as checked or unchecked. Requires user confirmation.',
  parameters: {
    type: 'object',
    required: ['item_ids', 'checked'],
    properties: {
      item_ids: {
        type: 'array',
        description: 'Array of shopping list item IDs to update',
        items: { type: 'string' },
      },
      checked: {
        type: 'string',
        description: '"true" to check off, "false" to uncheck',
        enum: ['true', 'false'],
      },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const itemIds = args.item_ids as string[];
    const isChecked = String(args.checked) === 'true';

    const matchingItems = state.shoppingList.items.filter((i) => itemIds.includes(i.id));
    if (matchingItems.length === 0) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'No matching shopping list items found.',
      };
    }

    return {
      success: true,
      data: {
        entityType: 'shoppingListItems',
        action: isChecked ? 'check' : 'uncheck',
        items: matchingItems.map((i) => ({ id: i.id, name: i.name })),
      },
      displayType: 'confirmation',
      message: `${isChecked ? 'Check off' : 'Uncheck'} ${matchingItems.length} item${matchingItems.length === 1 ? '' : 's'}?`,
    };
  },
};

export const removeShoppingItemsTool: ToolDefinition = {
  name: 'remove_shopping_items',
  description: 'Remove items from the shopping list. Requires user confirmation.',
  parameters: {
    type: 'object',
    required: ['item_ids'],
    properties: {
      item_ids: {
        type: 'array',
        description: 'Array of shopping list item IDs to remove',
        items: { type: 'string' },
      },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const itemIds = args.item_ids as string[];

    const matchingItems = state.shoppingList.items.filter((i) => itemIds.includes(i.id));
    if (matchingItems.length === 0) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'No matching shopping list items found.',
      };
    }

    return {
      success: true,
      data: {
        entityType: 'shoppingListItems',
        action: 'remove',
        items: matchingItems.map((i) => ({ id: i.id, name: i.name })),
      },
      displayType: 'confirmation',
      message: `Remove ${matchingItems.length} item${matchingItems.length === 1 ? '' : 's'} from the shopping list?`,
    };
  },
};

export const clearCheckedItemsTool: ToolDefinition = {
  name: 'clear_checked_items',
  description: 'Remove all checked items from the shopping list. Requires user confirmation.',
  parameters: {
    type: 'object',
    required: [],
    properties: {},
  },
  requiresConfirmation: true,
  execute: async (_args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const checkedItems = state.shoppingList.items.filter((i) => i.checked);

    if (checkedItems.length === 0) {
      return {
        success: false,
        data: null,
        displayType: 'text',
        message: 'No checked items to clear.',
      };
    }

    return {
      success: true,
      data: {
        entityType: 'shoppingListItems',
        action: 'clearChecked',
        items: checkedItems.map((i) => ({ id: i.id, name: i.name })),
        count: checkedItems.length,
      },
      displayType: 'confirmation',
      message: `Remove ${checkedItems.length} checked item${checkedItems.length === 1 ? '' : 's'} from the shopping list?`,
    };
  },
};

export const shoppingTools: ToolDefinition[] = [
  getShoppingListTool,
  addToShoppingListTool,
  checkShoppingItemsTool,
  removeShoppingItemsTool,
  clearCheckedItemsTool,
];
