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
      {
        path: 'shared/:shareId',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: SharedRecipeView } = await import('@screens/SharedRecipeView');
          return { Component: SharedRecipeView };
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
                path: 'ingredients/new/barcode-entry',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: IngredientBarcodeEntry } = await import('@screens/IngredientBarcodeEntry');
                  return { Component: IngredientBarcodeEntry };
                },
              },
              {
                path: 'recipes',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: Recipes } = await import('@screens/Recipes');
                  return { Component: Recipes };
                },
              },
              {
                path: 'recipes/:id',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: RecipeDetail } = await import('@screens/RecipeDetail');
                  return { Component: RecipeDetail };
                },
              },
              {
                path: 'recipes/:id/cook',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: CookMode } = await import('@screens/CookMode');
                  return { Component: CookMode };
                },
              },
              {
                path: 'recipes/new/from-text',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: RecipeFromText } = await import('@screens/RecipeFromText');
                  return { Component: RecipeFromText };
                },
              },
              {
                path: 'recipes/new/from-url',
                HydrateFallback: Loading,
                lazy: async () => {
                  const { default: RecipeFromUrl } = await import('@screens/RecipeFromUrl');
                  return { Component: RecipeFromUrl };
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
