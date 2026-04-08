import { describe, it, expect } from 'vitest';
import { TOOL_CALLING_SYSTEM_PROMPT, buildToolCallingSystemPrompt } from './toolCalling.prompts';

describe('toolCalling.prompts', () => {
  it('TOOL_CALLING_SYSTEM_PROMPT contains key keywords', () => {
    expect(TOOL_CALLING_SYSTEM_PROMPT).toContain('Demmi');
    expect(TOOL_CALLING_SYSTEM_PROMPT).toContain('tools');
    expect(TOOL_CALLING_SYSTEM_PROMPT).toContain('Memory');
  });

  it('buildToolCallingSystemPrompt returns base prompt with current date', () => {
    const result = buildToolCallingSystemPrompt();

    expect(result).toContain('Demmi');
    expect(result).toContain(new Date().getFullYear().toString());
  });

  it('buildToolCallingSystemPrompt appends user profile summary when provided', () => {
    const result = buildToolCallingSystemPrompt('Loves cooking Italian food');

    expect(result).toContain('Loves cooking Italian food');
  });

  it('buildToolCallingSystemPrompt appends memories when provided', () => {
    const memories = ['Prefers spicy food', 'Allergic to nuts'];

    const result = buildToolCallingSystemPrompt(undefined, memories);

    expect(result).toContain('Prefers spicy food');
    expect(result).toContain('Allergic to nuts');
  });
});
