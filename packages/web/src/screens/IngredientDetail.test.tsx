import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { IngredientDetail } from './IngredientDetail';
import type { Ingredient } from '@lib/ingredients';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'new' }),
  useLocation: () => ({ state: null, pathname: '/ingredients/new' }),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

jest.mock('@store/actions/ingredientActions', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    fetchIngredients: createAsyncThunk('ingredients/fetch', async () => []),
    createIngredient: createAsyncThunk('ingredients/create', async () => ({})),
    updateIngredient: createAsyncThunk('ingredients/update', async () => ({})),
    deleteIngredient: createAsyncThunk('ingredients/delete', async () => ({})),
  };
});

function createIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing-1',
    userId: 'user-1',
    name: 'Chicken Breast',
    type: 'protein',
    currentAmount: 500,
    servingSize: 100,
    unit: 'g',
    otherUnit: null,
    imageUrl: '',
    barcode: null,
    products: [],
    defaultProductId: null,
    nutrients: {
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      calories: 165,
    },
    ...overrides,
  };
}

describe('IngredientDetail - New Mode', () => {
  it('renders the page title for new ingredient', () => {
    renderWithProviders(<IngredientDetail />);
    expect(screen.getByText('← Back to Ingredients')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    renderWithProviders(<IngredientDetail />);
    expect(screen.getByText('Name *')).toBeInTheDocument();
    expect(screen.getByText('Type *')).toBeInTheDocument();
  });

  it('renders save and cancel buttons', () => {
    renderWithProviders(<IngredientDetail />);
    expect(screen.getByText('Create Ingredient')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});

describe('IngredientDetail - View Mode', () => {
  beforeEach(() => {
    const reactRouterDom = jest.requireMock('react-router-dom');
    reactRouterDom.useParams = () => ({ id: 'ing-1' });
  });

  it('renders the ingredient name in view mode', () => {
    const ingredient = createIngredient();
    renderWithProviders(<IngredientDetail />, {
      preloadedState: { ingredients: { items: [ingredient] } },
    });
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
  });

  it('renders Edit and Delete buttons in view mode', () => {
    const ingredient = createIngredient();
    renderWithProviders(<IngredientDetail />, {
      preloadedState: { ingredients: { items: [ingredient] } },
    });
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
