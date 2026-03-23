import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { CookMode } from './CookMode';
import type { Recipe } from '@lib/recipes';

vi.mock('@components/cook', () => ({
  VoiceIndicator: () => <div data-testid="voice-indicator">VoiceIndicator</div>,
}));

vi.mock('@hooks/useCookModeVoice', () => ({
  useCookModeVoice: () => ({
    voiceState: 'unsupported' as const,
  }),
}));

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe-1',
    userId: 'user-1',
    title: 'Test Recipe',
    description: 'A test recipe',
    category: 'dinner',
    prepTime: 10,
    cookTime: 20,
    servingSize: 4,
    instructions: ['Step 1: Prepare', 'Step 2: Cook', 'Step 3: Serve'],
    imageUrl: '',
    ingredients: [],
    share: null,
    ...overrides,
  };
}

describe('CookMode', () => {
  it('shows "Recipe not found" when recipe does not exist', () => {
    const { wrapper } = generateTestWrapper({ route: '/recipes/recipe-1', path: '/recipes/:id', preloadedState: { recipes: { items: [] } } });
    render(<CookMode />, { wrapper });
    expect(screen.getByText('Recipe not found.')).toBeInTheDocument();
  });

  it('shows "no instructions" message when recipe has no instructions', () => {
    const recipe = createRecipe({ instructions: [] });
    const { wrapper } = generateTestWrapper({ route: '/recipes/recipe-1', path: '/recipes/:id', preloadedState: { recipes: { items: [recipe] } } });
    render(<CookMode />, { wrapper });
    expect(
      screen.getByText('This recipe has no instructions yet.'),
    ).toBeInTheDocument();
  });

  it('renders the recipe title and first step', () => {
    const recipe = createRecipe();
    const { wrapper } = generateTestWrapper({ route: '/recipes/recipe-1', path: '/recipes/:id', preloadedState: { recipes: { items: [recipe] } } });
    render(<CookMode />, { wrapper });
    const titles = screen.getAllByText('Test Recipe');
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByText('Step 1: Prepare')).toBeInTheDocument();
  });

  it('renders step count', () => {
    const recipe = createRecipe();
    const { wrapper } = generateTestWrapper({ route: '/recipes/recipe-1', path: '/recipes/:id', preloadedState: { recipes: { items: [recipe] } } });
    render(<CookMode />, { wrapper });
    expect(screen.getByText('of 3 steps')).toBeInTheDocument();
  });

  it('renders the voice indicator', () => {
    const recipe = createRecipe();
    const { wrapper } = generateTestWrapper({ route: '/recipes/recipe-1', path: '/recipes/:id', preloadedState: { recipes: { items: [recipe] } } });
    render(<CookMode />, { wrapper });
    expect(screen.getByTestId('voice-indicator')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    const recipe = createRecipe();
    const { wrapper } = generateTestWrapper({ route: '/recipes/recipe-1', path: '/recipes/:id', preloadedState: { recipes: { items: [recipe] } } });
    render(<CookMode />, { wrapper });
    expect(screen.getByText('← Previous')).toBeInTheDocument();
    expect(screen.getByText('Next →')).toBeInTheDocument();
  });
});
