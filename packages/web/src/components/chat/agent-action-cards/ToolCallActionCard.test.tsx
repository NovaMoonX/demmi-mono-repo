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
            { id: 'r1', title: 'Pasta Carbonara', category: 'dinner' },
            { id: 'r2', title: 'Spaghetti Bolognese', category: 'dinner' },
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
        data: { items: [{ id: 's1', name: 'Milk', category: 'dairy' }], total: 1 },
        displayType: 'list',
        message: 'Shopping list has 1 item.',
      },
    },
  ],
};

describe('ToolCallActionCard', () => {
  it('renders tool results', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={completedAction} />,
      { wrapper },
    );
    expect(screen.getByText('Search Recipes')).toBeInTheDocument();
    expect(screen.getByText('Found 2 recipes.')).toBeInTheDocument();
    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
    expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
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

  it('renders action link for shopping list tool', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <ToolCallActionCard action={shoppingListAction} />,
      { wrapper },
    );
    const link = screen.getByText('View Shopping List →');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/shopping-list?from=chat');
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
});
