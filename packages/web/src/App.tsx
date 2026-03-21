import { DreamerUIProvider } from '@moondreamsdev/dreamer-ui/providers';
import { ErrorBoundary } from '@moondreamsdev/dreamer-ui/components';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { router } from '@routes/AppRoutes';
import { AuthProvider } from '@contexts/AuthContext';
import { store } from '@store/index';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <DreamerUIProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </DreamerUIProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
