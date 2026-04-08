import type { RootState, AppDispatch } from '@store/index';
import type { Tool as OllamaTool } from 'ollama/browser';

export type ToolDisplayType = 'list' | 'confirmation' | 'success' | 'error' | 'text';

export interface ToolResult {
  success: boolean;
  data: unknown;
  displayType: ToolDisplayType;
  message: string;
}

export interface ToolContext {
  getState: () => RootState;
  dispatch: AppDispatch;
  userId: string;
}

export interface ToolParameterProperty {
  type: string | string[];
  description: string;
  enum?: string[];
  items?: { type: string };
}

export interface ToolParameters {
  type: 'object';
  required: string[];
  properties: Record<string, ToolParameterProperty>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameters;
  requiresConfirmation: boolean;
  execute: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
}

export function toolDefinitionToOllama(def: ToolDefinition): OllamaTool {
  const result: OllamaTool = {
    type: 'function',
    function: {
      name: def.name,
      description: def.description,
      parameters: {
        type: def.parameters.type,
        required: def.parameters.required,
        properties: def.parameters.properties,
      },
    },
  };
  return result;
}
