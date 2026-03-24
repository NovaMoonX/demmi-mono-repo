import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { IngredientBarcodeScanner } from './IngredientBarcodeScanner';

const mockGetUserMedia = vi.fn();
const mockPermissionsQuery = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  mockGetUserMedia.mockRejectedValue(new Error('denied'));
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true,
    configurable: true,
  });

  mockPermissionsQuery.mockResolvedValue({ state: 'prompt', onchange: null });
  Object.defineProperty(navigator, 'permissions', {
    value: { query: mockPermissionsQuery },
    writable: true,
    configurable: true,
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

  it('shows camera denied message when permission is denied', async () => {
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new/barcode-scanner' });
    render(<IngredientBarcodeScanner />, { wrapper });
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText('Camera access denied')).toBeInTheDocument();
  });
});
