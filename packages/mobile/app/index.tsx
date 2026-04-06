import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import Constants from 'expo-constants';
import { useRef, useState, useCallback } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';

const WEB_APP_URL = 'https://demmi.moondreams.dev/';

export default function Index() {
  const webViewRef = useRef<WebView>(null);
  const colorScheme = useColorScheme();
  const [showScanner, setShowScanner] = useState(false);
  
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#020617' : '#f8fafc';
  const statusBarStyle = isDark ? 'light' : 'dark';

  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    setShowScanner(false);
    webViewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ type: 'barcode-result', barcode: '${data}' }) })); true;`,
    );
  }, []);

  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as { type?: string };
      if (data.type === 'scan-barcode') {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        if (status === 'granted') {
          setShowScanner(true);
        } else {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access to scan barcodes.',
          );
        }
      }
    } catch {
      // ignore non-JSON messages
    }
  }, []);

  if (showScanner) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar style={statusBarStyle} />
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style={statusBarStyle} />
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        userAgent={`Demmi-Mobile/${Constants.expoConfig?.version ?? '1.0.0'} (${Platform.OS}) ExpoWebView`}
        injectedJavaScriptBeforeContentLoaded={`window.ReactNativeWebView = true; true;`}
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});
