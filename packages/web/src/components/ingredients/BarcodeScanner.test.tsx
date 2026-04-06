import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarcodeScanner } from './BarcodeScanner';

describe('BarcodeScanner', () => {
  const defaultProps = {
    videoRef: { current: null } as React.RefObject<HTMLVideoElement | null>,
    isScanning: true,
    error: null as 'permission-denied' | 'no-camera' | 'scanner-unavailable' | null,
    onCancel: vi.fn(),
  };

  it('renders a video element', () => {
    render(<BarcodeScanner {...defaultProps} />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
  });

  it('shows scanning message when scanning is active', () => {
    render(<BarcodeScanner {...defaultProps} />);
    expect(screen.getByText('Point your camera at a barcode…')).toBeInTheDocument();
  });

  it('renders the cancel button', () => {
    render(<BarcodeScanner {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<BarcodeScanner {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows permission denied callout when error is permission-denied', () => {
    render(
      <BarcodeScanner
        {...defaultProps}
        isScanning={false}
        error='permission-denied'
      />,
    );
    expect(screen.getByTestId('callout')).toBeInTheDocument();
  });

  it('shows scanner unavailable callout when error is scanner-unavailable', () => {
    render(
      <BarcodeScanner
        {...defaultProps}
        isScanning={false}
        error='scanner-unavailable'
      />,
    );
    expect(screen.getByTestId('callout')).toBeInTheDocument();
  });

  it('shows waiting message when not scanning and no error', () => {
    render(
      <BarcodeScanner
        {...defaultProps}
        isScanning={false}
        error={null}
      />,
    );
    expect(screen.getByText('Waiting for camera…')).toBeInTheDocument();
  });
});
