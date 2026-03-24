import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { IngredientBarcodeEntry } from './IngredientBarcodeEntry';

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
    const { wrapper } = generateTestWrapper();
    render(<IngredientBarcodeEntry />, { wrapper });
    expect(screen.getByText('Enter Barcode')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    const { wrapper } = generateTestWrapper();
    render(<IngredientBarcodeEntry />, { wrapper });
    expect(
      screen.getByText('Type in the full barcode number to look up the product.'),
    ).toBeInTheDocument();
  });

  it('renders the barcode input field', () => {
    const { wrapper } = generateTestWrapper();
    render(<IngredientBarcodeEntry />, { wrapper });
    expect(screen.getByLabelText('Barcode Number')).toBeInTheDocument();
  });

  it('renders the Look Up Barcode button', () => {
    const { wrapper } = generateTestWrapper();
    render(<IngredientBarcodeEntry />, { wrapper });
    expect(screen.getByText('Look Up Barcode')).toBeInTheDocument();
  });

  it('renders the skip button initially', () => {
    const { wrapper } = generateTestWrapper();
    render(<IngredientBarcodeEntry />, { wrapper });
    expect(screen.getByText('Skip — go to manual entry')).toBeInTheDocument();
  });

  it('disables Look Up button when input is empty', () => {
    const { wrapper } = generateTestWrapper();
    render(<IngredientBarcodeEntry />, { wrapper });
    const button = screen.getByText('Look Up Barcode');
    expect(button).toBeDisabled();
  });

  it('renders sample barcode section', () => {
    const { wrapper } = generateTestWrapper();
    render(<IngredientBarcodeEntry />, { wrapper });
    expect(
      screen.getByText('Sample barcode — what to look for'),
    ).toBeInTheDocument();
  });
});
