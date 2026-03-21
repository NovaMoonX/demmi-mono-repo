import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { useRef } from 'react';

const WEB_APP_URL = 'https://demmi.web.app';

export default function Index() {
  const webViewRef = useRef<WebView>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        userAgent={`Demmi-Mobile/${Constants.expoConfig?.version ?? '1.0.0'} (${Platform.OS})`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
  },
});
