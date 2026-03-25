import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { CreateRecipeAgentActionCard } from './CreateRecipeAgentActionCard';

vi.mock('../GeneratingIndicator', () => ({
  GeneratingIndicator: () => <div data-testid="generating-indicator" />,
}));

const baseProps = {
  onConfirmIntent: vi.fn(),
  onRejectIntent: vi.fn(),
  onApprove: vi.fn(),
  onReject: vi.fn(),
  onAddToShoppingList: vi.fn().mockResolvedValue(3),
  onSkipShoppingList: vi.fn(),
};

const mockProposal = {
  title: 'Spaghetti Carbonara',
  description: 'Classic Italian pasta dish',
  category: 'dinner' as const,
  cuisine: 'italian' as const,
  prepTime: 10,
  cookTime: 20,
  servingSize: 4,
  instructions: ['Boil pasta', 'Mix eggs'],
  imageUrl: '',
  ingredients: [
    { name: 'Pasta', type: 'grains' as const, unit: 'g' as const, servings: 200, isNew: false, existingIngredientId: 'i1' },
    { name: 'Eggs', type: 'dairy' as const, unit: 'piece' as const, servings: 3, isNew: true, existingIngredientId: null },
  ],
};

function renderCard(action: Parameters<typeof CreateRecipeAgentActionCard>[0]['action']) {
  const { wrapper } = generateTestWrapper();
  render(
    <CreateRecipeAgentActionCard {...baseProps} action={action} />,
    { wrapper },
  );
}

describe('CreateRecipeAgentActionCard', () => {
  describe('pending_confirmation', () => {
    it('renders confirm and cancel buttons', () => {
      renderCard({
        type: 'create_recipe',
        status: 'pending_confirmation',
        proposedName: 'Spaghetti',
        recipes: [],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/Yes, create it/)).toBeInTheDocument();
      expect(screen.getByText(/No, cancel/)).toBeInTheDocument();
    });

    it('shows the proposed recipe name', () => {
      renderCard({
        type: 'create_recipe',
        status: 'pending_confirmation',
        proposedName: 'Spaghetti Carbonara',
        recipes: [],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/Spaghetti Carbonara/)).toBeInTheDocument();
    });
  });

  describe('generating statuses', () => {
    it.each([
      ['generating_name', 'Generating name…'],
      ['generating_info', 'Generating basic info…'],
      ['generating_description', 'Generating description…'],
      ['generating_ingredients', 'Generating ingredients…'],
      ['generating_instructions', 'Generating instructions…'],
    ] as const)('shows generating indicator and step label for %s', (status, label) => {
      renderCard({
        type: 'create_recipe',
        status,
        proposedName: 'Pasta',
        recipes: [],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByTestId('generating-indicator')).toBeInTheDocument();
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('shows partial recipe name when available', () => {
      renderCard({
        type: 'create_recipe',
        status: 'generating_description',
        proposedName: '',
        recipes: [],
        recipe: {
          name: 'Spaghetti Carbonara',
          category: 'dinner',
          cuisine: 'italian',
          servings: 4,
          totalTime: 30,
          description: null,
          ingredients: null,
          instructions: null,
        },
        completedSteps: ['name', 'info'],
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    it('shows cuisine badge when partial recipe has cuisine', () => {
      renderCard({
        type: 'create_recipe',
        status: 'generating_description',
        proposedName: '',
        recipes: [],
        recipe: {
          name: 'Spaghetti Carbonara',
          category: 'dinner',
          cuisine: 'italian',
          servings: 4,
          totalTime: 30,
          description: null,
          ingredients: null,
          instructions: null,
        },
        completedSteps: ['name', 'info'],
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/Italian/)).toBeInTheDocument();
    });
  });

  describe('pending_approval', () => {
    beforeEach(() => {
      renderCard({
        type: 'create_recipe',
        status: 'pending_approval',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: ['name', 'info', 'description', 'ingredients', 'instructions'],
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });
    });

    it('renders the recipe title', () => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    it('renders the recipe description', () => {
      expect(screen.getByText('Classic Italian pasta dish')).toBeInTheDocument();
    });

    it('renders the category badge', () => {
      expect(screen.getByText('dinner')).toBeInTheDocument();
    });

    it('renders the cuisine badge', () => {
      const hasCuisineBadge = screen.getAllByTestId('badge').some((b) => b.textContent?.includes('Italian'));
      expect(hasCuisineBadge).toBe(true);
    });

    it('renders time info', () => {
      expect(screen.getByText(/Prep 10m/)).toBeInTheDocument();
      expect(screen.getByText(/Cook 20m/)).toBeInTheDocument();
      expect(screen.getByText(/30m total/)).toBeInTheDocument();
    });

    it('renders servings count', () => {
      expect(screen.getByText(/4 servings/)).toBeInTheDocument();
    });

    it('renders ingredient names', () => {
      expect(screen.getByText('Pasta')).toBeInTheDocument();
      expect(screen.getByText('Eggs')).toBeInTheDocument();
    });

    it('renders save and decline buttons', () => {
      expect(screen.getByText(/Save to My Recipes/)).toBeInTheDocument();
      expect(screen.getByText('Decline')).toBeInTheDocument();
    });

    it('renders instruction count', () => {
      expect(screen.getByText(/2 instruction/)).toBeInTheDocument();
    });
  });

  describe('iterating', () => {
    it('renders generating indicator with updating fields message', () => {
      renderCard({
        type: 'create_recipe',
        status: 'iterating',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: ['description', 'ingredients'],
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByTestId('generating-indicator')).toBeInTheDocument();
      expect(screen.getByText(/Updating description, ingredients/)).toBeInTheDocument();
    });

    it('renders skeleton placeholders for updating fields', () => {
      renderCard({
        type: 'create_recipe',
        status: 'iterating',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: ['description'],
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    it('renders recipe title when name is not updating', () => {
      renderCard({
        type: 'create_recipe',
        status: 'iterating',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: ['description'],
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    it('renders cuisine badge when info is not updating', () => {
      renderCard({
        type: 'create_recipe',
        status: 'iterating',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: ['description'],
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/Italian/)).toBeInTheDocument();
    });
  });

  describe('stale', () => {
    it('renders stale label and recipe preview', () => {
      renderCard({
        type: 'create_recipe',
        status: 'stale',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/Previous version/i)).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    it('renders cuisine and category in the stale recipe preview', () => {
      renderCard({
        type: 'create_recipe',
        status: 'stale',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      const badges = screen.getAllByTestId('badge');
      expect(badges.some((b) => b.textContent?.includes('dinner'))).toBe(true);
      expect(badges.some((b) => b.textContent?.includes('Italian'))).toBe(true);
    });
  });

  describe('approved', () => {
    it('renders saved confirmation text', () => {
      renderCard({
        type: 'create_recipe',
        status: 'approved',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/Recipe saved/)).toBeInTheDocument();
    });

    it('renders recipe title and description', () => {
      renderCard({
        type: 'create_recipe',
        status: 'approved',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
      expect(screen.getByText('Classic Italian pasta dish')).toBeInTheDocument();
    });

    it('renders category and cuisine badges', () => {
      renderCard({
        type: 'create_recipe',
        status: 'approved',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      const badges = screen.getAllByTestId('badge');
      expect(badges.some((b) => b.textContent?.includes('dinner'))).toBe(true);
      expect(badges.some((b) => b.textContent?.includes('Italian'))).toBe(true);
    });

    it('renders shopping list prompt when decision is null', () => {
      renderCard({
        type: 'create_recipe',
        status: 'approved',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/add the ingredients to your shopping list/)).toBeInTheDocument();
      expect(screen.getByText('Yes, add them')).toBeInTheDocument();
      expect(screen.getByText('No thanks')).toBeInTheDocument();
    });

    it('shows items added count when decision is "added"', () => {
      renderCard({
        type: 'create_recipe',
        status: 'approved',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: 'added',
        shoppingListItemsAdded: 5,
      });

      expect(screen.getByText(/5 ingredients added/)).toBeInTheDocument();
    });

    it('does not show shopping list prompt when decision is "skipped"', () => {
      renderCard({
        type: 'create_recipe',
        status: 'approved',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: 'skipped',
        shoppingListItemsAdded: null,
      });

      expect(screen.queryByText(/add the ingredients to your shopping list/)).not.toBeInTheDocument();
    });
  });

  describe('rejected', () => {
    it('renders declined label', () => {
      renderCard({
        type: 'create_recipe',
        status: 'rejected',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText('Declined')).toBeInTheDocument();
    });

    it('renders recipe title', () => {
      renderCard({
        type: 'create_recipe',
        status: 'rejected',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    it('renders category badge', () => {
      renderCard({
        type: 'create_recipe',
        status: 'rejected',
        proposedName: 'Spaghetti Carbonara',
        recipes: [mockProposal],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/dinner/)).toBeInTheDocument();
    });
  });

  describe('cancelled', () => {
    it('renders cancellation message when no partial data', () => {
      renderCard({
        type: 'create_recipe',
        status: 'cancelled',
        proposedName: '',
        recipes: [],
        recipe: null,
        completedSteps: null,
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/Recipe generation was cancelled/)).toBeInTheDocument();
    });

    it('renders partial recipe when available', () => {
      renderCard({
        type: 'create_recipe',
        status: 'cancelled',
        proposedName: '',
        recipes: [],
        recipe: {
          name: 'Spaghetti Carbonara',
          category: 'dinner',
          cuisine: 'italian',
          servings: 4,
          totalTime: 30,
          description: 'Classic Italian pasta dish',
          ingredients: null,
          instructions: null,
        },
        completedSteps: ['name', 'info', 'description'],
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      expect(screen.getByText(/Generation cancelled/)).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    it('renders cuisine in partial recipe', () => {
      renderCard({
        type: 'create_recipe',
        status: 'cancelled',
        proposedName: '',
        recipes: [],
        recipe: {
          name: 'Spaghetti Carbonara',
          category: 'dinner',
          cuisine: 'italian',
          servings: 4,
          totalTime: 30,
          description: 'Classic Italian pasta dish',
          ingredients: null,
          instructions: null,
        },
        completedSteps: ['name', 'info', 'description'],
        updatingFields: null,
        shoppingListDecision: null,
        shoppingListItemsAdded: null,
      });

      const hasCuisineBadge = screen.getAllByTestId('badge').some((b) => b.textContent?.includes('Italian'));
      expect(hasCuisineBadge).toBe(true);
    });
  });
});
