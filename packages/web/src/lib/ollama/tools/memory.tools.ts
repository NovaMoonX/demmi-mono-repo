import type { ToolDefinition, ToolContext, ToolResult } from './tool.types';

export const getMemoriesTool: ToolDefinition = {
  name: 'get_memories',
  description: 'Read all stored agent memories for the current user.',
  parameters: {
    type: 'object',
    required: [],
    properties: {},
  },
  requiresConfirmation: false,
  execute: async (_args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const memories = state.memory.items;

    const items = memories.map((m) => ({
      id: m.id,
      content: m.content,
      category: m.category,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    return {
      success: true,
      data: { items, total: items.length },
      displayType: 'list',
      message: items.length > 0
        ? `You have ${items.length} stored memor${items.length === 1 ? 'y' : 'ies'}.`
        : 'No memories stored yet.',
    };
  },
};

export const saveMemoryTool: ToolDefinition = {
  name: 'save_memory',
  description: 'Store a new memory about the user. Only store key information that is NOT already in their profile. Be intentional — do not store trivial or redundant information.',
  parameters: {
    type: 'object',
    required: ['content', 'category'],
    properties: {
      content: {
        type: 'string',
        description: 'The memory text (1-2 sentences max). Should capture key context, preferences, or goals.',
      },
      category: {
        type: 'string',
        description: 'The category of the memory',
        enum: ['preference', 'context', 'goal', 'household', 'other'],
      },
    },
  },
  requiresConfirmation: false,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const content = String(args.content);
    const category = String(args.category) as 'preference' | 'context' | 'goal' | 'household' | 'other';

    if (!content.trim()) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Memory content cannot be empty.',
      };
    }

    const { createMemoryAsync } = await import('@store/actions/memoryActions');
    const now = Date.now();
    const result = await context.dispatch(createMemoryAsync({
      content,
      category,
      createdAt: now,
      updatedAt: now,
    }));

    if (result.meta.requestStatus === 'fulfilled') {
      return {
        success: true,
        data: result.payload,
        displayType: 'success',
        message: `Noted: "${content}"`,
      };
    }

    return {
      success: false,
      data: null,
      displayType: 'error',
      message: 'Failed to save memory.',
    };
  },
};

export const updateMemoryTool: ToolDefinition = {
  name: 'update_memory',
  description: 'Update an existing agent memory. Requires user confirmation.',
  parameters: {
    type: 'object',
    required: ['memory_id', 'content'],
    properties: {
      memory_id: {
        type: 'string',
        description: 'The ID of the memory to update',
      },
      content: {
        type: 'string',
        description: 'The updated memory text',
      },
      category: {
        type: 'string',
        description: 'Updated category',
        enum: ['preference', 'context', 'goal', 'household', 'other'],
      },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const memory = state.memory.items.find((m) => m.id === args.memory_id);

    if (!memory) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Memory not found.',
      };
    }

    const proposedChanges: Record<string, { current: unknown; proposed: unknown }> = {};

    if (args.content !== undefined) {
      proposedChanges.content = { current: memory.content, proposed: String(args.content) };
    }
    if (args.category !== undefined) {
      proposedChanges.category = { current: memory.category, proposed: String(args.category) };
    }

    return {
      success: true,
      data: {
        entityType: 'memory',
        entityId: memory.id,
        entityName: memory.content.slice(0, 50),
        proposedChanges,
        fullEntity: memory,
      },
      displayType: 'confirmation',
      message: `Update memory: "${memory.content.slice(0, 50)}..."?`,
    };
  },
};

export const deleteMemoryTool: ToolDefinition = {
  name: 'delete_memory',
  description: 'Delete an agent memory. Requires user confirmation.',
  parameters: {
    type: 'object',
    required: ['memory_id'],
    properties: {
      memory_id: {
        type: 'string',
        description: 'The ID of the memory to delete',
      },
    },
  },
  requiresConfirmation: true,
  execute: async (args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const memory = state.memory.items.find((m) => m.id === args.memory_id);

    if (!memory) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'Memory not found.',
      };
    }

    return {
      success: true,
      data: {
        entityType: 'memory',
        entityId: memory.id,
        entityName: memory.content.slice(0, 50),
        entity: memory,
      },
      displayType: 'confirmation',
      message: `Delete memory: "${memory.content.slice(0, 50)}..."?`,
    };
  },
};

export const memoryTools: ToolDefinition[] = [
  getMemoriesTool,
  saveMemoryTool,
  updateMemoryTool,
  deleteMemoryTool,
];
