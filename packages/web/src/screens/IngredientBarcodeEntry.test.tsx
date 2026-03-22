import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { IngredientBarcodeEntry } from './IngredientBarcodeEntry';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null, pathname: '/ingredients/new/barcode-entry' }),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

const mockTriggerLookup = vi.fn();
vi.mock('@store/api/openFoodFactsApi', () => ({
  openFoodFactsApi: {
    reducerPath: 'openFoodFactsApi',
    reducer: (s = {}) => s,
    middleware: () => (n: Function) => (a: unknown) => n(a),
  },
  useGetProductByBarcodeQuery: vi.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
  }),
  useLazyGetProductByBarcodeQuery: () => [
    mockTriggerLookup,
    { data: null, isFetching: false, isError: false },
  ],
}));

vi.mock('@/utils', () => ({
  getBarcodePrefillOptions: vi.fn().mockReturnValue({
    options: [],
    defaultOptionId: null,
    hasMultipleOptions: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('IngredientBarcodeEntry', () => {
  it('renders the page title', () => {
    renderWithProviders(<IngredientBarcodeEntry />);
    expect(screen.getByText('Enter Barcode')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderWithProviders(<IngredientBarcodeEntry />);
    expect(
      screen.getByText('Type in the full barcode number to look up the product.'),
    ).toBeInTheDocument();
  });

  it('renders the barcode input field', () => {
    renderWithProviders(<IngredientBarcodeEntry />);
    expect(screen.getByLabelText('Barcode Number')).toBeInTheDocument();
  });

  it('renders the Look Up Barcode button', () => {
    renderWithProviders(<IngredientBarcodeEntry />);
    expect(screen.getByText('Look Up Barcode')).toBeInTheDocument();
  });

  it('renders the skip button initially', () => {
    renderWithProviders(<IngredientBarcodeEntry />);
    expect(screen.getByText('Skip — go to manual entry')).toBeInTheDocument();
  });

  it('disables Look Up button when input is empty', () => {
    renderWithProviders(<IngredientBarcodeEntry />);
    const button = screen.getByText('Look Up Barcode');
    expect(button).toBeDisabled();
  });

  it('navigates when skip is clicked', () => {
    renderWithProviders(<IngredientBarcodeEntry />);
    fireEvent.click(screen.getByText('Skip — go to manual entry'));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/ingredients/new',
      expect.objectContaining({ state: expect.any(Object) }),
    );
  });

  it('renders sample barcode section', () => {
    renderWithProviders(<IngredientBarcodeEntry />);
    expect(
      screen.getByText('Sample barcode — what to look for'),
    ).toBeInTheDocument();
  });
});
