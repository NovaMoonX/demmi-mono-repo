import { describe, it, expect } from 'vitest';
import { generatedId } from './generatedId';

describe('generatedId', () => {
  it('generates a string for URL-friendly entities', () => {
    const recipeId = generatedId('recipe');
    expect(typeof recipeId).toBe('string');
    expect(recipeId.length).toBeGreaterThan(0);
  });

  it('generates a string for standard entities', () => {
    const chatId = generatedId('chat');
    expect(typeof chatId).toBe('string');
    expect(chatId.length).toBeGreaterThan(0);
  });

  it('generates unique IDs on each call', () => {
    const id1 = generatedId('recipe');
    const id2 = generatedId('recipe');
    expect(id1).not.toBe(id2);
  });

  it('uses nanoid (shorter) for URL-friendly entities', () => {
    const recipeId = generatedId('recipe');
    const ingredientId = generatedId('ingredient');
    const plannedId = generatedId('planned');
    expect(recipeId.length).toBeLessThan(40);
    expect(ingredientId.length).toBeLessThan(40);
    expect(plannedId.length).toBeLessThan(40);
  });

  it('uses uuid v4 (longer) for standard entities', () => {
    const chatId = generatedId('chat');
    const msgId = generatedId('msg');
    const slId = generatedId('sl');
    const prodId = generatedId('prod');
    expect(chatId).toMatch(/^[0-9a-f-]{36}$/);
    expect(msgId).toMatch(/^[0-9a-f-]{36}$/);
    expect(slId).toMatch(/^[0-9a-f-]{36}$/);
    expect(prodId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
