import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { SharedRecipeView } from './SharedRecipeView';
import type { SharedRecipe } from '@lib/recipes/sharedRecipe.types';

const mockNavigate = jest.fn();
let mockShareId = 'share-123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ shareId: mockShareId }),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

const mockFetchSharedRecipe = jest.fn();

jest.mock('@store/actions/shareRecipeActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    shareRecipe: createAsyncThunk('recipes/share', async () => ({})),
    unshareRecipe: createAsyncThunk('recipes/unshare', async () => ({})),
    fetchSharedRecipe: createAsyncThunk('recipes/fetchShared', async (shareId: string) => {
      const result = await mockFetchSharedRecipe(shareId);
      return result;
    }),
  };
});

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
    { ingredientId: 'ing-1', name: 'Pasta', servings: 2 },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockShareId = 'share-123';
});

describe('SharedRecipeView', () => {
  it('shows loading state initially', () => {
    mockFetchSharedRecipe.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<SharedRecipeView />);
    expect(screen.getByText('Loading recipe…')).toBeInTheDocument();
  });

  it('renders the shared recipe when loaded', async () => {
    mockFetchSharedRecipe.mockResolvedValue(mockSharedRecipe);
    renderWithProviders(<SharedRecipeView />);

    await waitFor(() => {
      expect(screen.getByText('Shared Pasta')).toBeInTheDocument();
    });
    expect(screen.getByText('A delicious shared pasta recipe')).toBeInTheDocument();
  });

  it('renders instructions when available', async () => {
    mockFetchSharedRecipe.mockResolvedValue(mockSharedRecipe);
    renderWithProviders(<SharedRecipeView />);

    await waitFor(() => {
      expect(screen.getByText('Boil water')).toBeInTheDocument();
    });
    expect(screen.getByText('Cook pasta')).toBeInTheDocument();
  });

  it('renders ingredients when available', async () => {
    mockFetchSharedRecipe.mockResolvedValue(mockSharedRecipe);
    renderWithProviders(<SharedRecipeView />);

    await waitFor(() => {
      expect(screen.getByText('Pasta')).toBeInTheDocument();
    });
  });

  it('shows not found state when recipe not found', async () => {
    mockFetchSharedRecipe.mockResolvedValue(null);
    renderWithProviders(<SharedRecipeView />);

    await waitFor(() => {
      expect(screen.getByText('Recipe not found')).toBeInTheDocument();
    });
  });

  it('shows not found when fetch fails', async () => {
    mockFetchSharedRecipe.mockRejectedValue(new Error('fail'));
    renderWithProviders(<SharedRecipeView />);

    await waitFor(() => {
      expect(screen.getByText('Recipe not found')).toBeInTheDocument();
    });
  });
});
