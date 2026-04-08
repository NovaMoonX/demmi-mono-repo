import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerTool,
  registerTools,
  getToolByName,
  getAllToolDefinitions,
  getToolsForOllama,
  clearToolRegistry,
} from './tool.registry';
import type { ToolDefinition } from './tool.types';

const mockTool: ToolDefinition = {
  name: 'test_tool',
  description: 'A test tool',
  parameters: {
    type: 'object',
    required: ['arg1'],
    properties: {
      arg1: { type: 'string', description: 'Test arg' },
    },
  },
  requiresConfirmation: false,
  execute: vi.fn(async () => ({
    success: true,
    data: null,
    displayType: 'text' as const,
    message: 'ok',
  })),
};

describe('tool.registry', () => {
  beforeEach(() => {
    clearToolRegistry();
  });

  it('registerTool adds a tool and getToolByName retrieves it', () => {
    registerTool(mockTool);

    const result = getToolByName('test_tool');

    expect(result).toBe(mockTool);
  });

  it('registerTools adds multiple tools at once', () => {
    const secondTool: ToolDefinition = {
      ...mockTool,
      name: 'second_tool',
      description: 'Another tool',
    };

    registerTools([mockTool, secondTool]);

    const first = getToolByName('test_tool');
    const second = getToolByName('second_tool');

    expect(first).toBe(mockTool);
    expect(second).toBe(secondTool);
  });

  it('getToolByName returns undefined for unknown tools', () => {
    const result = getToolByName('nonexistent');

    expect(result).toBeUndefined();
  });

  it('getAllToolDefinitions returns all registered tools', () => {
    const secondTool: ToolDefinition = {
      ...mockTool,
      name: 'second_tool',
    };

    registerTools([mockTool, secondTool]);

    const result = getAllToolDefinitions();

    expect(result).toHaveLength(2);
    expect(result).toContain(mockTool);
    expect(result).toContain(secondTool);
  });

  it('getToolsForOllama converts to Ollama format', () => {
    registerTool(mockTool);

    const result = getToolsForOllama();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'function',
      function: {
        name: 'test_tool',
        description: 'A test tool',
        parameters: mockTool.parameters,
      },
    });
  });

  it('clearToolRegistry clears all tools', () => {
    registerTool(mockTool);

    const beforeClear = getAllToolDefinitions();
    expect(beforeClear).toHaveLength(1);

    clearToolRegistry();

    const afterClear = getAllToolDefinitions();
    expect(afterClear).toHaveLength(0);
  });
});
