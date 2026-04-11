import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { ToolCallActionCard } from './ToolCallActionCard';
import type { AgentToolCallAction } from '@lib/ollama/action-types/toolCallAction.types';

const completedAction: AgentToolCallAction = {
  type: 'tool_call',
  status: 'completed',
  currentToolIndex: 0,
  toolCalls: [
    {
      toolName: 'search_recipes',
      args: { query: 'pasta' },
      status: 'completed',
      requiresConfirmation: false,
      result: {
        success: true,
        data: {
          items: [
            { id: 'r1', title: 'Pasta Carbonara', category: 'dinner', cuisine: 'italian', prepTime: 10, cookTime: 20, servingSize: 2 },
            { id: 'r2', title: 'Spaghetti Bolognese', category: 'dinner', cuisine: 'italian', prepTime: 15, cookTime: 30, servingSize: 4 },
          ],
          total: 2,
        },
        displayType: 'list',
        message: 'Found 2 recipes.',
      },
    },
  ],
};

const confirmationAction: AgentToolCallAction = {
  type: 'tool_call',
  status: 'pending_confirmation',
  currentToolIndex: 0,
  toolCalls: [
    {
      toolName: 'delete_recipe',
      args: { recipe_id: 'r1' },
      status: 'pending',
      requiresConfirmation: true,
      result: {
        success: true,
        data: {
          entityType: 'recipe',
          entityId: 'r1',
          entityName: 'Pasta Carbonara',
          entity: {},
        },
        displayType: 'confirmation',
        message: 'Are you sure you want to delete "Pasta Carbonara"?',
      },
    },
  ],
};

const shoppingListAction: AgentToolCallAction = {
  type: 'tool_call',
  status: 'completed',
  currentToolIndex: 0,
  toolCalls: [
    {
      toolName: 'get_shopping_list',
      args: {},
      status: 'completed',
      requiresConfirmation: false,
      result: {
        success: true,
        data: { items: [{ id: 's1', name: 'Milk', category: 'dairy', checked: false }], total: 1 },
        displayType: 'list',
        message: 'Shopping list has 1 item.',
      },
    },
  ],
};

describe('ToolCallActionCard', () => {
  it('renders recipe result card with items', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={completedAction} />,
      { wrapper },
    );
    expect(screen.getByText('Search Recipes')).toBeInTheDocument();
    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    expect(screen.getByText('Recipes (2)')).toBeInTheDocument();
  });

  it('shows Done badge for completed tools', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={completedAction} />,
      { wrapper },
    );
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders confirmation buttons for pending tools', () => {
    const { wrapper } = generateTestWrapper();
    const onConfirm = () => {};
    const onReject = () => {};
    render(
      <ToolCallActionCard
        action={confirmationAction}
        onConfirmToolCall={onConfirm}
        onRejectToolCall={onReject}
      />,
      { wrapper },
    );
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('shows confirmation message', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={confirmationAction} />,
      { wrapper },
    );
    expect(screen.getByText(/Are you sure you want to delete "Pasta Carbonara"\?/)).toBeInTheDocument();
  });

  it('renders links for recipe results', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={completedAction} />,
      { wrapper },
    );
    const links = screen.getAllByRole('link');
    const recipeLinks = links.filter((l) => l.getAttribute('href')?.includes('/recipes/'));
    expect(recipeLinks.length).toBe(2);
    expect(recipeLinks[0]).toHaveAttribute('href', '/recipes/r1?from=chat');
    expect(recipeLinks[1]).toHaveAttribute('href', '/recipes/r2?from=chat');
  });

  it('renders shopping list result card with items', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={shoppingListAction} />,
      { wrapper },
    );
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Open Shopping List →')).toBeInTheDocument();
  });

  it('shows processing indicator for executing tools', () => {
    const executingAction: AgentToolCallAction = {
      type: 'tool_call',
      status: 'calling_tools',
      currentToolIndex: 0,
      toolCalls: [
        {
          toolName: 'search_ingredients',
          args: { query: 'chicken' },
          status: 'executing',
          requiresConfirmation: false,
          result: null,
        },
      ],
    };
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={executingAction} />,
      { wrapper },
    );
    expect(screen.getByText('Processing…')).toBeInTheDocument();
    expect(screen.getByText('Running…')).toBeInTheDocument();
  });

  it('renders ingredient result card with pills', () => {
    const ingredientAction: AgentToolCallAction = {
      type: 'tool_call',
      status: 'completed',
      currentToolIndex: 0,
      toolCalls: [
        {
          toolName: 'search_ingredients',
          args: {},
          status: 'completed',
          requiresConfirmation: false,
          result: {
            success: true,
            data: {
              items: [
                { id: 'i1', name: 'Chicken', type: 'meat', currentAmount: 2, unit: 'lb' },
                { id: 'i2', name: 'Garlic', type: 'produce', currentAmount: 5, unit: 'piece' },
              ],
              total: 2,
            },
            displayType: 'list',
            message: 'Found 2 ingredients.',
          },
        },
      ],
    };
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={ingredientAction} />,
      { wrapper },
    );
    expect(screen.getByText('Chicken')).toBeInTheDocument();
    expect(screen.getByText('Garlic')).toBeInTheDocument();
    expect(screen.getByText('Ingredients (2)')).toBeInTheDocument();
  });

  it('renders recipe created success card', () => {
    const createAction: AgentToolCallAction = {
      type: 'tool_call',
      status: 'completed',
      currentToolIndex: 0,
      toolCalls: [
        {
          toolName: 'create_recipe',
          args: { title: 'Turkey Burger' },
          status: 'completed',
          requiresConfirmation: false,
          result: {
            success: true,
            data: {
              id: 'r-new',
              title: 'Turkey Burger',
              category: 'dinner',
              cuisine: 'american',
              prepTime: 10,
              cookTime: 15,
              servingSize: 4,
              instructions: ['Mix ingredients', 'Form patties', 'Grill'],
            },
            displayType: 'success',
            message: 'Recipe "Turkey Burger" created successfully.',
          },
        },
      ],
    };
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={createAction} />,
      { wrapper },
    );
    expect(screen.getByText('Turkey Burger')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('View Recipe →')).toBeInTheDocument();
  });

  it('renders calendar meal plan result card', () => {
    const calendarAction: AgentToolCallAction = {
      type: 'tool_call',
      status: 'completed',
      currentToolIndex: 0,
      toolCalls: [
        {
          toolName: 'get_meal_plan',
          args: {},
          status: 'completed',
          requiresConfirmation: false,
          result: {
            success: true,
            data: {
              items: [
                { id: 'p1', date: '2026-04-11', category: 'dinner', recipeName: 'Pasta', recipeId: 'r1' },
              ],
              total: 1,
            },
            displayType: 'list',
            message: 'Found 1 planned meal.',
          },
        },
      ],
    };
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={calendarAction} />,
      { wrapper },
    );
    expect(screen.getByText('Pasta')).toBeInTheDocument();
    expect(screen.getByText('2026-04-11')).toBeInTheDocument();
    expect(screen.getByText('Open Calendar →')).toBeInTheDocument();
  });

  it('renders empty state card when no results', () => {
    const emptyAction: AgentToolCallAction = {
      type: 'tool_call',
      status: 'completed',
      currentToolIndex: 0,
      toolCalls: [
        {
          toolName: 'search_recipes',
          args: { query: 'nonexistent' },
          status: 'completed',
          requiresConfirmation: false,
          result: {
            success: true,
            data: { items: [], total: 0 },
            displayType: 'list',
            message: 'No recipes found matching your criteria.',
          },
        },
      ],
    };
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={emptyAction} />,
      { wrapper },
    );
    expect(screen.getByText('No recipes found matching your criteria.')).toBeInTheDocument();
  });
});
