import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import type { SharedRecipe } from '@lib/recipes/sharedRecipe.types';
import { render, screen, waitFor } from '@testing-library/react';
import { DataSnapshot, get } from 'firebase/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { SharedRecipeView } from './SharedRecipeView';

const mockShareId = 'share-123';

const mockSharedRecipe: SharedRecipe = {
  title: 'Shared Pasta',
  description: 'A delicious shared pasta recipe',
  category: 'dinner',
  prepTime: 10,
  cookTime: 30,
  servingSize: 4,
  instructions: ['Boil water', 'Cook pasta'],
  imageUrl: '',
  ingredients: [
    { ingredientId: 'ing-1', name: 'Pasta', servings: 2, unit: '' },
  ],
  shareId: mockShareId,
  recipeId: 'rec-123',
  userId: 'user-1',
  sharedAt: Date.now(),
};

describe('SharedRecipeView', () => {
  it('shows loading state initially', () => {
    const { wrapper } = generateTestWrapper({
      route: `/shared/${mockShareId}`,
      path: '/shared/:shareId',
    });
    render(<SharedRecipeView />, {
      wrapper,
    });
    expect(screen.getByText('Loading recipe…')).toBeInTheDocument();
  });

  it('shows not found state when recipe not found', async () => {
    const { wrapper } = generateTestWrapper({
      route: `/shared/${mockShareId}`,
      path: '/shared/:shareId',
    });
    render(<SharedRecipeView />, {
      wrapper,
    });

    await waitFor(() => {
      expect(screen.getByText('Recipe not found')).toBeInTheDocument();
    });
  });

  describe('when recipe is found', () => {
    beforeEach(() => {
      vi.mocked(get).mockResolvedValueOnce(
        mock<DataSnapshot>({
          val: () => Promise.resolve(mockSharedRecipe),
          exists: () => true,
        }),
      );
    });

    it('renders the shared recipe when loaded', async () => {
      const { wrapper } = generateTestWrapper({
        route: `/shared/${mockShareId}`,
        path: '/shared/:shareId',
      });
      render(<SharedRecipeView />, {
        wrapper,
      });

      await waitFor(() => {
        expect(screen.getByText('Shared Pasta')).toBeInTheDocument();
      });
      expect(
        screen.getByText('A delicious shared pasta recipe'),
      ).toBeInTheDocument();
    });

    it('renders instructions when available', async () => {
      const { wrapper } = generateTestWrapper({
        route: `/shared/${mockShareId}`,
        path: '/shared/:shareId',
      });
      render(<SharedRecipeView />, {
        wrapper,
      });

      await waitFor(() => {
        expect(screen.getByText('Boil water')).toBeInTheDocument();
      });
      expect(screen.getByText('Cook pasta')).toBeInTheDocument();
    });

    it('renders ingredients when available', async () => {
      const { wrapper } = generateTestWrapper({
        route: `/shared/${mockShareId}`,
        path: '/shared/:shareId',
      });
      render(<SharedRecipeView />, {
        wrapper,
      });

      await waitFor(() => {
        expect(screen.getByText('Pasta')).toBeInTheDocument();
      });
    });
  });
});
