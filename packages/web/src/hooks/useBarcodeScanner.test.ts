import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBarcodeScanner } from './useBarcodeScanner';

vi.mock('./useRuntimeEnvironment', () => ({
  useRuntimeEnvironment: () => ({
    isElectron: false,
    isMobileWebView: false,
    canInstallOllama: true,
  }),
}));

vi.mock('zxing-wasm/reader', () => ({
  readBarcodes: vi.fn().mockResolvedValue([]),
}));

const mockGetUserMedia = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUserMedia.mockRejectedValue(new Error('denied'));
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useBarcodeScanner', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useBarcodeScanner());
    expect(result.current.isScanning).toBe(false);
    expect(result.current.lastResult).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.videoRef).toBeDefined();
  });

  it('sets permission-denied error when camera access is denied', async () => {
    const { result } = renderHook(() => useBarcodeScanner());

    await act(async () => {
      result.current.startScan();
    });

    expect(result.current.error).toBe('permission-denied');
    expect(result.current.isScanning).toBe(false);
  });

  it('starts scanning when camera access is granted', async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }],
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useBarcodeScanner());

    await act(async () => {
      result.current.startScan();
    });

    expect(result.current.isScanning).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('stops scanning when stopScan is called', async () => {
    const mockStop = vi.fn();
    const mockStream = {
      getTracks: () => [{ stop: mockStop }],
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useBarcodeScanner());

    await act(async () => {
      result.current.startScan();
    });

    expect(result.current.isScanning).toBe(true);

    act(() => {
      result.current.stopScan();
    });

    expect(result.current.isScanning).toBe(false);
    expect(mockStop).toHaveBeenCalled();
  });

  it('provides a videoRef', () => {
    const { result } = renderHook(() => useBarcodeScanner());
    expect(result.current.videoRef.current).toBeNull();
  });

  it('exposes startScan and stopScan functions', () => {
    const { result } = renderHook(() => useBarcodeScanner());
    expect(typeof result.current.startScan).toBe('function');
    expect(typeof result.current.stopScan).toBe('function');
  });
});
