import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@lib/recipes';

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe-1',
    userId: 'user-1',
    title: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta',
    category: 'dinner',
    prepTime: 15,
    cookTime: 20,
    servingSize: 4,
    instructions: ['Boil pasta', 'Cook bacon', 'Mix together'],
    imageUrl: 'https://example.com/carbonara.jpg',
    ingredients: [
      { ingredientId: 'ing-1', servings: 2 },
      { ingredientId: 'ing-2', servings: 1 },
    ],
    share: null,
    ...overrides,
  };
}

describe('RecipeCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the recipe title', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
  });

  it('renders the recipe description', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    expect(screen.getByText('Classic Italian pasta')).toBeInTheDocument();
  });

  it('renders the category badge', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    expect(screen.getByText('dinner')).toBeInTheDocument();
  });

  it('renders prep and cook times', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    expect(screen.getByText('15m')).toBeInTheDocument();
    expect(screen.getByText('20m')).toBeInTheDocument();
    expect(screen.getByText('Prep')).toBeInTheDocument();
    expect(screen.getByText('Cook')).toBeInTheDocument();
  });

  it('renders total time', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    expect(screen.getByText('35 minutes')).toBeInTheDocument();
    expect(screen.getByText('Total Time')).toBeInTheDocument();
  });

  it('renders singular "minute" when total is 1', () => {
    render(<RecipeCard recipe={createRecipe({ prepTime: 0, cookTime: 1 })} />);
    expect(screen.getByText('1 minute')).toBeInTheDocument();
  });

  it('renders serving size', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Servings')).toBeInTheDocument();
  });

  it('renders singular "Serving" for 1 serving', () => {
    render(<RecipeCard recipe={createRecipe({ servingSize: 1 })} />);
    expect(screen.getByText('Serving')).toBeInTheDocument();
  });

  it('renders instruction count', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    expect(screen.getByText('3 steps')).toBeInTheDocument();
  });

  it('renders ingredient count', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('renders singular "step" and "item" for single entries', () => {
    render(<RecipeCard recipe={createRecipe({ instructions: ['Step 1'], ingredients: [{ ingredientId: 'i1', servings: 1 }] })} />);
    expect(screen.getByText('1 step')).toBeInTheDocument();
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('renders the recipe image', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    const img = screen.getByAltText('Spaghetti Carbonara');
    expect(img).toHaveAttribute('src', 'https://example.com/carbonara.jpg');
  });

  it('calls onClick when the card is clicked', () => {
    const onClick = jest.fn();
    const recipe = createRecipe();
    render(<RecipeCard recipe={recipe} onClick={onClick} />);
    fireEvent.click(screen.getByText('Spaghetti Carbonara'));
    expect(onClick).toHaveBeenCalledWith(recipe);
  });

  it('does not throw when onClick is not provided', () => {
    render(<RecipeCard recipe={createRecipe()} />);
    expect(() => fireEvent.click(screen.getByText('Spaghetti Carbonara'))).not.toThrow();
  });

  it('renders the category emoji', () => {
    render(<RecipeCard recipe={createRecipe({ category: 'breakfast' })} />);
    expect(screen.getByText('🌅')).toBeInTheDocument();
  });
});
