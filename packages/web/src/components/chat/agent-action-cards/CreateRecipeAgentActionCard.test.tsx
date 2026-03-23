import { describe, it, expect, vi } from 'vitest';
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

describe('CreateRecipeAgentActionCard', () => {
  it('renders confirmation UI for pending_confirmation status', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <CreateRecipeAgentActionCard
        {...baseProps}
        action={{
          type: 'create_recipe',
          status: 'pending_confirmation',
          proposedName: 'Spaghetti',
          recipes: [],
          recipe: null,
          completedSteps: null,
          updatingFields: null,
          shoppingListDecision: null,
          shoppingListItemsAdded: null,
        }}
      />,
      { wrapper },
    );
    expect(screen.getByText(/Yes, create it/)).toBeInTheDocument();
    expect(screen.getByText(/No, cancel/)).toBeInTheDocument();
  });

  it('renders generating UI for generating_name status', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <CreateRecipeAgentActionCard
        {...baseProps}
        action={{
          type: 'create_recipe',
          status: 'generating_name',
          proposedName: 'Pasta',
          recipes: [],
          recipe: null,
          completedSteps: null,
          updatingFields: null,
          shoppingListDecision: null,
          shoppingListItemsAdded: null,
        }}
      />,
      { wrapper },
    );
    expect(screen.getByTestId('generating-indicator')).toBeInTheDocument();
  });

  it('renders recipe preview for pending_approval status', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <CreateRecipeAgentActionCard
        {...baseProps}
        action={{
          type: 'create_recipe',
          status: 'pending_approval',
          proposedName: 'Spaghetti Carbonara',
          recipes: [mockProposal],
          recipe: null,
          completedSteps: ['name', 'info', 'description', 'ingredients', 'instructions'],
          updatingFields: null,
          shoppingListDecision: null,
          shoppingListItemsAdded: null,
        }}
      />,
      { wrapper },
    );
    expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
  });
});
