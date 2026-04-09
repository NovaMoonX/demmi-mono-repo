import { describe, it, expect } from 'vitest';
import { getToolCallingSystemPrompt, buildToolCallingSystemPrompt } from './toolCalling.prompts';

describe('toolCalling.prompts', () => {
  it('getToolCallingSystemPrompt contains key keywords', () => {
    const prompt = getToolCallingSystemPrompt();
    expect(prompt).toContain('Demmi');
    expect(prompt).toContain('tool_calls');
    expect(prompt).toContain('Memory');
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
