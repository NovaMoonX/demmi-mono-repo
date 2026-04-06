import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { IngredientBarcodeScanner } from './IngredientBarcodeScanner';

const mockStartScan = vi.fn();
const mockStopScan = vi.fn();
const mockUseBarcodeScanner = vi.fn(() => ({
  isScanning: false,
  lastResult: null as string | null,
  error: null as string | null,
  videoRef: { current: null },
  startScan: mockStartScan,
  stopScan: mockStopScan,
}));

vi.mock('@hooks/useBarcodeScanner', () => ({
  useBarcodeScanner: () => mockUseBarcodeScanner(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseBarcodeScanner.mockReturnValue({
    isScanning: false,
    lastResult: null,
    error: null,
    videoRef: { current: null },
    startScan: mockStartScan,
    stopScan: mockStopScan,
  });
});

describe('IngredientBarcodeScanner', () => {
  it('renders the page title', () => {
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new/barcode-scanner' });
    render(<IngredientBarcodeScanner />, { wrapper });
    expect(screen.getByText('Scan Barcode')).toBeInTheDocument();
  });

  it('renders description text', () => {
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new/barcode-scanner' });
    render(<IngredientBarcodeScanner />, { wrapper });
    expect(
      screen.getByText('Point your camera at a product barcode to get started.'),
    ).toBeInTheDocument();
  });

  it('renders a back link to ingredients', () => {
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new/barcode-scanner' });
    render(<IngredientBarcodeScanner />, { wrapper });
    expect(screen.getByText('← Back to Ingredients')).toBeInTheDocument();
  });

  it('renders a video element', () => {
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new/barcode-scanner' });
    render(<IngredientBarcodeScanner />, { wrapper });
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
  });

  it('shows camera denied callout when permission is denied', () => {
    mockUseBarcodeScanner.mockReturnValue({
      isScanning: false,
      lastResult: null,
      error: 'permission-denied',
      videoRef: { current: null },
      startScan: mockStartScan,
      stopScan: mockStopScan,
    });
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new/barcode-scanner' });
    render(<IngredientBarcodeScanner />, { wrapper });
    expect(screen.getByTestId('callout')).toBeInTheDocument();
  });

  it('calls startScan on mount', () => {
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new/barcode-scanner' });
    render(<IngredientBarcodeScanner />, { wrapper });
    expect(mockStartScan).toHaveBeenCalledTimes(1);
  });
});
