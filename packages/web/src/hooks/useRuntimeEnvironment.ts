export function useRuntimeEnvironment() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const isExpoWebView =
    typeof window !== 'undefined' &&
    (window.navigator.userAgent.includes('ExpoWebView') ||
      window.navigator.userAgent.includes('Demmi-Mobile') ||
      !!(window as unknown as { ReactNativeWebView?: boolean }).ReactNativeWebView);
  const isMobileWebView = isExpoWebView;
  const canInstallOllama = !isMobileWebView;
  return { isElectron, isMobileWebView, canInstallOllama };
}
