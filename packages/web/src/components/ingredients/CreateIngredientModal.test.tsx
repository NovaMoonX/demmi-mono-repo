import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateIngredientModal } from './CreateIngredientModal';

describe('CreateIngredientModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelectManual: vi.fn(),
    onSelectBarcode: vi.fn(),
    onSelectBarcodeEntry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal with title', () => {
    render(<CreateIngredientModal {...defaultProps} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('renders Manual Entry option', () => {
    render(<CreateIngredientModal {...defaultProps} />);
    expect(screen.getByText('Manual Entry')).toBeInTheDocument();
    expect(screen.getByText('✍️')).toBeInTheDocument();
  });

  it('renders Enter Barcode option', () => {
    render(<CreateIngredientModal {...defaultProps} />);
    expect(screen.getByText('Enter Barcode')).toBeInTheDocument();
    expect(screen.getByText('🔢')).toBeInTheDocument();
  });

  it('calls onClose and onSelectManual when Manual Entry is clicked', () => {
    render(<CreateIngredientModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Manual Entry'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectManual).toHaveBeenCalledTimes(1);
  });

  it('calls onClose and onSelectBarcodeEntry when Enter Barcode is clicked', () => {
    render(<CreateIngredientModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Enter Barcode'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectBarcodeEntry).toHaveBeenCalledTimes(1);
  });

  it('renders descriptions for each option', () => {
    render(<CreateIngredientModal {...defaultProps} />);
    expect(screen.getByText(/Fill everything in yourself/)).toBeInTheDocument();
    expect(screen.getByText(/Enter it to look up the product/)).toBeInTheDocument();
  });
});
