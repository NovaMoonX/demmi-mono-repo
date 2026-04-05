import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRuntimeEnvironment } from './useRuntimeEnvironment';

describe('useRuntimeEnvironment', () => {
  const originalUserAgent = window.navigator.userAgent;

  afterEach(() => {
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
    delete (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView;
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(originalUserAgent);
  });

  it('detects a plain browser environment', () => {
    const { result } = renderHook(() => useRuntimeEnvironment());
    expect(result.current.isElectron).toBe(false);
    expect(result.current.isMobileWebView).toBe(false);
    expect(result.current.isOllamaAvailable).toBe(true);
  });

  it('detects Electron when window.electronAPI is present', () => {
    (window as unknown as { electronAPI: object }).electronAPI = {};
    const { result } = renderHook(() => useRuntimeEnvironment());
    expect(result.current.isElectron).toBe(true);
    expect(result.current.isMobileWebView).toBe(false);
    expect(result.current.isOllamaAvailable).toBe(true);
  });

  it('detects mobile WebView via ReactNativeWebView global', () => {
    (window as unknown as { ReactNativeWebView: boolean }).ReactNativeWebView = true;
    const { result } = renderHook(() => useRuntimeEnvironment());
    expect(result.current.isMobileWebView).toBe(true);
    expect(result.current.isOllamaAvailable).toBe(false);
  });

  it('detects mobile WebView via ExpoWebView user agent', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 ExpoWebView/1.0',
    );
    const { result } = renderHook(() => useRuntimeEnvironment());
    expect(result.current.isMobileWebView).toBe(true);
    expect(result.current.isOllamaAvailable).toBe(false);
  });
});
