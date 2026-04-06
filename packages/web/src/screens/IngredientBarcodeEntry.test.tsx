import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { IngredientBarcodeEntry } from './IngredientBarcodeEntry';

vi.mock('@/utils', () => ({
  getBarcodePrefillOptions: vi.fn().mockReturnValue({
    options: [],
    defaultOptionId: null,
    hasMultipleOptions: false,
  }),
}));

const mockStartScan = vi.fn();
const mockStopScan = vi.fn();

vi.mock('@hooks/useBarcodeScanner', () => ({
  useBarcodeScanner: () => ({
    isScanning: false,
    lastResult: null,
    error: null,
    videoRef: { current: null },
    startScan: mockStartScan,
    stopScan: mockStopScan,
  }),
}));

vi.mock('@hooks/useRuntimeEnvironment', () => ({
  useRuntimeEnvironment: () => ({
    isElectron: false,
    isMobileWebView: false,
    canInstallOllama: true,
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

  it('renders the scan barcode button', () => {
    const { wrapper } = generateTestWrapper();
    render(<IngredientBarcodeEntry />, { wrapper });
    expect(screen.getByText('📷 Scan barcode with camera')).toBeInTheDocument();
  });

  it('calls startScan when scan button is clicked', () => {
    const { wrapper } = generateTestWrapper();
    render(<IngredientBarcodeEntry />, { wrapper });
    fireEvent.click(screen.getByText('📷 Scan barcode with camera'));
    expect(mockStartScan).toHaveBeenCalledTimes(1);
  });
});
