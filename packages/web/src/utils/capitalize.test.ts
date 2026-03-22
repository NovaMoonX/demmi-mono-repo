import { describe, it, expect } from 'vitest';
import { capitalize } from './capitalize';

describe('capitalize', () => {
  it('capitalizes the first letter of a word', () => {
    const result = capitalize('hello');
    expect(result).toBe('Hello');
  });

  it('returns empty string for empty input', () => {
    const result = capitalize('');
    expect(result).toBe('');
  });

  it('handles single character', () => {
    const result = capitalize('a');
    expect(result).toBe('A');
  });

  it('does not change already capitalized strings', () => {
    const result = capitalize('Hello');
    expect(result).toBe('Hello');
  });

  it('only capitalizes the first letter', () => {
    const result = capitalize('hello world');
    expect(result).toBe('Hello world');
  });
});
