export function useRuntimeEnvironment() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const isExpoWebView =
    typeof window !== 'undefined' &&
    (window.navigator.userAgent.includes('ExpoWebView') ||
      !!(window as unknown as { ReactNativeWebView?: boolean }).ReactNativeWebView);
  const isMobileWebView = isExpoWebView;
  const isOllamaAvailable = !isMobileWebView;
  return { isElectron, isMobileWebView, isOllamaAvailable };
}
