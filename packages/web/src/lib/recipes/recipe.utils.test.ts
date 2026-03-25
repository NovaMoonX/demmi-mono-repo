import { describe, it, expect } from 'vitest';
import { capitalizeCuisine, getCuisineColorClass } from './recipe.utils';

describe('capitalizeCuisine', () => {
  it('capitalizes a single word', () => {
    const result = capitalizeCuisine('italian');
    expect(result).toBe('Italian');
  });

  it('capitalizes each word in a hyphenated cuisine', () => {
    const result = capitalizeCuisine('middle-eastern');
    expect(result).toBe('Middle Eastern');
  });

  it('handles multiple hyphens', () => {
    const result = capitalizeCuisine('south-east-asian');
    expect(result).toBe('South East Asian');
  });

  it('handles already capitalized input', () => {
    const result = capitalizeCuisine('American');
    expect(result).toBe('American');
  });

  it('returns empty string for empty input', () => {
    const result = capitalizeCuisine('');
    expect(result).toBe('');
  });

  it('handles all known cuisines correctly', () => {
    expect(capitalizeCuisine('mexican')).toBe('Mexican');
    expect(capitalizeCuisine('chinese')).toBe('Chinese');
    expect(capitalizeCuisine('japanese')).toBe('Japanese');
    expect(capitalizeCuisine('thai')).toBe('Thai');
    expect(capitalizeCuisine('indian')).toBe('Indian');
    expect(capitalizeCuisine('french')).toBe('French');
    expect(capitalizeCuisine('greek')).toBe('Greek');
    expect(capitalizeCuisine('american')).toBe('American');
  });
});

describe('getCuisineColorClass', () => {
  const colorMap: Record<string, string> = {
    italian: 'bg-red-500/20 text-red-700',
    mexican: 'bg-orange-500/20 text-orange-700',
    'middle-eastern': 'bg-teal-500/20 text-teal-700',
  };

  it('returns the correct class for a known cuisine', () => {
    const result = getCuisineColorClass('italian', colorMap);
    expect(result).toBe('bg-red-500/20 text-red-700');
  });

  it('returns the correct class for another known cuisine', () => {
    const result = getCuisineColorClass('mexican', colorMap);
    expect(result).toBe('bg-orange-500/20 text-orange-700');
  });

  it('returns the correct class for a hyphenated cuisine key', () => {
    const result = getCuisineColorClass('middle-eastern', colorMap);
    expect(result).toBe('bg-teal-500/20 text-teal-700');
  });

  it('returns fallback class for an unknown cuisine', () => {
    const result = getCuisineColorClass('unknown-cuisine', colorMap);
    expect(result).toBe('bg-muted text-muted-foreground');
  });

  it('returns fallback for an empty string key', () => {
    const result = getCuisineColorClass('', colorMap);
    expect(result).toBe('bg-muted text-muted-foreground');
  });

  it('returns fallback when colorMap is empty', () => {
    const result = getCuisineColorClass('italian', {});
    expect(result).toBe('bg-muted text-muted-foreground');
  });
});
