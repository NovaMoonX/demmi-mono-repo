import { render } from '@testing-library/react-native';
import Index from '../index';

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockWebView = React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
    React.createElement(View, { ...props, ref, testID: 'webview' }),
  );
  return {
    __esModule: true,
    default: MockWebView,
    WebView: MockWebView,
  };
});

jest.mock('expo-constants', () => ({
  expoConfig: { version: '1.0.0' },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: (props: Record<string, unknown>) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { ...props, testID: 'status-bar' });
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: (props: { children?: unknown }) =>
      React.createElement(View, { testID: 'safe-area-view' }, props.children),
  };
});

jest.mock('expo-barcode-scanner', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BarCodeScanner: (props: Record<string, unknown>) =>
      React.createElement(View, { ...props, testID: 'barcode-scanner' }),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  };
});

describe('Mobile Index Screen', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<Index />);
    expect(getByTestId('safe-area-view')).toBeTruthy();
  });

  it('renders a WebView component', () => {
    const { getByTestId } = render(<Index />);
    expect(getByTestId('webview')).toBeTruthy();
  });

  it('points the WebView to the correct URL', () => {
    const { getByTestId } = render(<Index />);
    const webview = getByTestId('webview');
    expect(webview.props.source).toEqual({ uri: 'https://demmi.moondreams.dev/' });
  });
});
