import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeToolCall, executeToolCalls } from './toolExecutor';
import { registerTool, clearToolRegistry } from './tool.registry';
import type { ToolDefinition, ToolContext } from './tool.types';
import type { RootState, AppDispatch } from '@store/index';

const mockContext: ToolContext = {
  getState: vi.fn(() => ({}) as RootState),
  dispatch: vi.fn() as unknown as AppDispatch,
  userId: 'user-1',
};

const createMockTool = (overrides: Partial<ToolDefinition> = {}): ToolDefinition => ({
  name: 'test_tool',
  description: 'A test tool',
  parameters: {
    type: 'object',
    required: [],
    properties: {},
  },
  requiresConfirmation: false,
  execute: vi.fn(async () => ({
    success: true,
    data: null,
    displayType: 'text' as const,
    message: 'ok',
  })),
  ...overrides,
});

describe('toolExecutor', () => {
  beforeEach(() => {
    clearToolRegistry();
  });

  it('executeToolCall with a known tool that succeeds', async () => {
    const tool = createMockTool();
    registerTool(tool);

    const result = await executeToolCall(
      { name: 'test_tool', arguments: { foo: 'bar' } },
      mockContext,
    );

    expect(result.toolName).toBe('test_tool');
    expect(result.result.success).toBe(true);
    expect(result.requiresConfirmation).toBe(false);
    expect(tool.execute).toHaveBeenCalledWith({ foo: 'bar' }, mockContext);
  });

  it('executeToolCall with an unknown tool returns skipped result', async () => {
    const result = await executeToolCall(
      { name: 'unknown_tool', arguments: {} },
      mockContext,
    );

    expect(result.toolName).toBe('unknown_tool');
    expect(result.result.success).toBe(false);
    expect(result.skipped).toBe(true);
  });

  it('executeToolCall with a confirmation tool returns requiresConfirmation true', async () => {
    const tool = createMockTool({
      name: 'confirm_tool',
      requiresConfirmation: true,
    });
    registerTool(tool);

    const result = await executeToolCall(
      { name: 'confirm_tool', arguments: {} },
      mockContext,
    );

    expect(result.requiresConfirmation).toBe(true);
  });

  it('executeToolCall catches execution errors and returns error result', async () => {
    const tool = createMockTool({
      execute: vi.fn(async () => {
        throw new Error('boom');
      }),
    });
    registerTool(tool);

    const result = await executeToolCall(
      { name: 'test_tool', arguments: {} },
      mockContext,
    );

    expect(result.result.success).toBe(false);
    expect(result.result.displayType).toBe('error');
    expect(result.result.message).toContain('boom');
  });

  it('executeToolCalls processes multiple calls and fires onToolComplete', async () => {
    const toolA = createMockTool({ name: 'tool_a' });
    const toolB = createMockTool({ name: 'tool_b' });
    registerTool(toolA);
    registerTool(toolB);

    const onToolComplete = vi.fn();

    const results = await executeToolCalls(
      [
        { name: 'tool_a', arguments: {} },
        { name: 'tool_b', arguments: {} },
      ],
      mockContext,
      onToolComplete,
    );

    expect(results).toHaveLength(2);
    expect(onToolComplete).toHaveBeenCalledTimes(2);
    expect(onToolComplete).toHaveBeenCalledWith(0, expect.objectContaining({ toolName: 'tool_a' }));
    expect(onToolComplete).toHaveBeenCalledWith(1, expect.objectContaining({ toolName: 'tool_b' }));
  });

  it('executeToolCalls skips unknown tools silently', async () => {
    const tool = createMockTool({ name: 'real_tool' });
    registerTool(tool);

    const onToolComplete = vi.fn();

    const results = await executeToolCalls(
      [
        { name: 'real_tool', arguments: {} },
        { name: 'fake_tool', arguments: {} },
      ],
      mockContext,
      onToolComplete,
    );

    expect(results).toHaveLength(1);
    expect(results[0].toolName).toBe('real_tool');
    expect(onToolComplete).toHaveBeenCalledTimes(1);
  });
});
