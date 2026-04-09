import type { Tool as OllamaTool } from 'ollama/browser';
import type { ToolDefinition } from './tool.types';
import { toolDefinitionToOllama } from './tool.types';

const TOOL_REGISTRY = new Map<string, ToolDefinition>();

export function registerTool(tool: ToolDefinition): void {
  TOOL_REGISTRY.set(tool.name, tool);
}

export function registerTools(tools: ToolDefinition[]): void {
  for (const tool of tools) {
    registerTool(tool);
  }
}

export function getToolByName(name: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.get(name);
}

export function getAllToolDefinitions(): ToolDefinition[] {
  return Array.from(TOOL_REGISTRY.values());
}

export function getToolsForOllama(): OllamaTool[] {
  const result = getAllToolDefinitions().map(toolDefinitionToOllama);
  return result;
}

export function clearToolRegistry(): void {
  TOOL_REGISTRY.clear();
}

export function getAllToolsPromptDescription(): string {
  const tools = getAllToolDefinitions();
  const lines = tools.map((tool) => {
    const params = Object.entries(tool.parameters.properties)
      .map(([key, prop]) => {
        const req = tool.parameters.required.includes(key) ? ' (required)' : ' (optional)';
        const enumStr = prop.enum ? ` — one of: ${prop.enum.join(', ')}` : '';
        return `    - ${key}: ${prop.type}${req}${enumStr} — ${prop.description}`;
      })
      .join('\n');
    const paramsBlock = params ? `\n  Parameters:\n${params}` : '\n  Parameters: none';
    const result = `- **${tool.name}**: ${tool.description}${paramsBlock}`;
    return result;
  });
  return lines.join('\n\n');
}
