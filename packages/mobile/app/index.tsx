import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { useRef } from 'react';

const WEB_APP_URL = 'https://demmi.moondreams.dev/';

export default function Index() {
  const webViewRef = useRef<WebView>(null);
  const colorScheme = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#020617' : '#f8fafc';
  const statusBarStyle = isDark ? 'light' : 'dark';

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
