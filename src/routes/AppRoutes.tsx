import { createBrowserRouter } from 'react-router-dom';

import Chat from '@screens/Chat';
import Ingredients from '@screens/Ingredients';
import IngredientDetail from '@screens/IngredientDetail';
import Meals from '@screens/Meals';
import MealDetail from '@screens/MealDetail';
import CalendarScreen from '@screens/CalendarScreen';
import { ShoppingList } from '@screens/ShoppingList';
import Account from '@screens/Account';
import Auth from '@screens/Auth';
import VerifyEmail from '@screens/VerifyEmail';
import Layout from '@ui/Layout';
import Loading from '@ui/Loading';
import ProtectedRoute from '@components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Chat />,
      },
      {
        path: 'ingredients',
        element: <Ingredients />,
      },
      {
        path: 'ingredients/:id',
        element: <IngredientDetail />,
      },
      {
        path: 'meals',
        element: <Meals />,
      },
      {
        path: 'meals/:id',
        element: <MealDetail />,
      },
      {
        path: 'calendar',
        element: <CalendarScreen />,
      },
      {
        path: 'shopping-list',
        element: <ShoppingList />,
      },
      {
        path: 'account',
        element: <Account />,
      },
      // About page (lazy loaded)
      {
        path: 'about',
        HydrateFallback: Loading,
        lazy: async () => {
          const { default: About } = await import('@screens/About');
          return { Component: About };
        },
      },
    ],
  },
]);
