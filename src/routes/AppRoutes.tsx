import { createBrowserRouter, Outlet } from 'react-router-dom';

import Home from '@screens/Home';
import Layout from '@ui/Layout';
import Loading from '@ui/Loading';
import ProtectedRoutes from './ProtectedRoutes';
import ErrorFallback from '@screens/ErrorFallback';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    ErrorBoundary: ErrorFallback,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: About } = await import('@screens/About');
          return { Component: About };
        },
      },
      {
        path: 'auth',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: Auth } = await import('@screens/Auth');
          return { Component: Auth };
        },
      },
      {
        path: 'verify-email',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: VerifyEmail } = await import('@screens/VerifyEmail');
          return { Component: VerifyEmail };
        },
      },
      // Protected routes - require authentication and email verification (unless demo mode is active)
      {
        element: <ProtectedRoutes />,
        children: [
          {
            element: <Layout />,
            children: [
              {
                path: 'chat',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: Chat } = await import('@screens/Chat');
                  return { Component: Chat };
                },
              },
              {
                path: 'ingredients',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: Ingredients } = await import('@screens/Ingredients');
                  return { Component: Ingredients };
                },
              },
              {
                path: 'ingredients/:id',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: IngredientDetail } = await import('@screens/IngredientDetail');
                  return { Component: IngredientDetail };
                },
              },
              {
                path: 'ingredients/new/barcode',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: IngredientBarcodeScanner } = await import('@screens/IngredientBarcodeScanner');
                  return { Component: IngredientBarcodeScanner };
                },
              },
              {
                path: 'meals',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: Meals } = await import('@screens/Meals');
                  return { Component: Meals };
                },
              },
              {
                path: 'meals/:id',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: MealDetail } = await import('@screens/MealDetail');
                  return { Component: MealDetail };
                },
              },
              {
                path: 'meals/new/from-text',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: MealFromText } = await import('@screens/MealFromText');
                  return { Component: MealFromText };
                },
              },
              {
                path: 'meals/new/from-url',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: MealFromUrl } = await import('@screens/MealFromUrl');
                  return { Component: MealFromUrl };
                },
              },
              {
                path: 'calendar',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: CalendarScreen } = await import('@screens/CalendarScreen');
                  return { Component: CalendarScreen };
                },
              },
              {
                path: 'shopping-list',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { ShoppingList } = await import('@screens/ShoppingList');
                  return { Component: ShoppingList };
                },
              },
              {
                path: 'account',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: Account } = await import('@screens/Account');
                  return { Component: Account };
                },
              },
            ],
          },
        ],
      },
      {
        path: '*',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: NotFound } = await import('@screens/NotFound');
          return { Component: NotFound };
        },
      },
    ],
  },
]);
