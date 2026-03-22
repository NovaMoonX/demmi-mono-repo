import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IngredientBarcodeScanner } from './IngredientBarcodeScanner';

const mockGetUserMedia = vi.fn();
const mockPermissionsQuery = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useLocation: () => ({ state: null, pathname: '/ingredients/new/barcode-scanner' }),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

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
    render(<IngredientBarcodeScanner />);
    expect(screen.getByText('Scan Barcode')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<IngredientBarcodeScanner />);
    expect(
      screen.getByText('Point your camera at a product barcode to get started.'),
    ).toBeInTheDocument();
  });

  it('renders a back link to ingredients', () => {
    render(<IngredientBarcodeScanner />);
    expect(screen.getByText('← Back to Ingredients')).toBeInTheDocument();
  });

  it('renders a video element', () => {
    render(<IngredientBarcodeScanner />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
  });

  it('shows camera denied message when permission is denied', async () => {
    render(<IngredientBarcodeScanner />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText('Camera access denied')).toBeInTheDocument();
  });
});
