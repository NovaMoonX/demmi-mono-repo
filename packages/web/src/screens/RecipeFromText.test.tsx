import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { RecipeFromText } from './RecipeFromText';
import { createRecipeAction } from '@lib/ollama/actions';
import { AgentRecipeProposal } from '@/lib/ollama/action-types/createRecipeAction.types';

vi.mock('@components/chat/OllamaModelControl', () => ({
  OllamaModelControl: () => <div data-testid="ollama-model-control">OllamaModelControl</div>,
}));

vi.mock('@lib/ollama/actions', () => ({
  createRecipeAction: {
    execute: vi.fn().mockResolvedValue({ cancelled: false, data: { proposal: null } }),
  },
}));

const mockProposal: AgentRecipeProposal = {
  title: 'Spaghetti Carbonara',
  description: 'Classic Italian pasta dish',
  category: 'dinner',
  cuisine: 'italian',
  prepTime: 10,
  cookTime: 20,
  servingSize: 4,
  instructions: ['Boil pasta', 'Mix eggs'],
  imageUrl: '',
  ingredients: [
    { name: 'Pasta', type: 'grains' as const, unit: 'g' as const, servings: 200, isNew: false, existingIngredientId: 'i1' },
    { name: 'Eggs', type: 'dairy' as const, unit: 'piece' as const, servings: 3, isNew: true, existingIngredientId: null },
  ],
};

function renderScreen() {
  const { wrapper } = generateTestWrapper({
    preloadedState: {
      chats: { conversations: [], currentChatId: null, selectedModel: 'test-model' },
    },
  });
  render(<RecipeFromText />, { wrapper });
}

async function renderAndReachGenerating() {
  let resolveAction!: (value: unknown) => void;
  const pendingAction = new Promise((res) => {
    resolveAction = res;
  });
  vi.mocked(createRecipeAction.execute).mockReturnValueOnce(pendingAction as ReturnType<typeof createRecipeAction.execute>);

  renderScreen();
  fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'My recipe text' } });
  fireEvent.click(screen.getByText('Generate'));

  return { resolveAction };
}

async function renderAndReachResult() {
  vi.mocked(createRecipeAction.execute).mockResolvedValueOnce({
    cancelled: false,
    data: { proposal: mockProposal },
    completedSteps: ['proposeName', 'generateBasicInfo', 'generateDescription', 'generateIngredients', 'generateInstructions'],
  });

  renderScreen();
  fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'My recipe text' } });
  fireEvent.click(screen.getByText('Generate'));

  await waitFor(() => expect(screen.getByText('Recipe Ready!')).toBeInTheDocument());
}

describe('RecipeFromText', () => {
  describe('paste phase', () => {
    it('renders the page title', () => {
      renderScreen();
      expect(screen.getByText('Paste Your Recipe')).toBeInTheDocument();
    });

    it('renders the description text', () => {
      renderScreen();
      expect(
        screen.getByText(
          "Someone sent you a recipe? Paste the full text below and we'll take it from there.",
        ),
      ).toBeInTheDocument();
    });

    it('renders the back link', () => {
      renderScreen();
      expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
    });

    it('renders the textarea', () => {
      renderScreen();
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });

    it('renders Generate and Cancel buttons', () => {
      renderScreen();
      expect(screen.getByText('Generate')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders the OllamaModelControl', () => {
      renderScreen();
      expect(screen.getByTestId('ollama-model-control')).toBeInTheDocument();
    });
  });

  describe('generating phase', () => {
    it('shows the generating heading', async () => {
      await renderAndReachGenerating();
      expect(screen.getByText('Generating Recipe…')).toBeInTheDocument();
    });

    it('shows the initial step label', async () => {
      await renderAndReachGenerating();
      expect(screen.getByText('Generating name…')).toBeInTheDocument();
    });

    it('renders a Stop button', async () => {
      await renderAndReachGenerating();
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    it('shows the back link', async () => {
      await renderAndReachGenerating();
      expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
    });

    it('shows partial recipe name when onStepComplete fires', async () => {
      let capturedOnStepComplete: ((key: string, data: Record<string, unknown>) => void) | undefined;

      vi.mocked(createRecipeAction.execute).mockImplementationOnce(
        (_model, _ctx, runtime) => {
          capturedOnStepComplete = runtime.onStepComplete;
          return new Promise(() => {});
        },
      );

      renderScreen();
      fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'My recipe text' } });
      fireEvent.click(screen.getByText('Generate'));

      await waitFor(() => expect(screen.getByText('Generating Recipe…')).toBeInTheDocument());

      capturedOnStepComplete?.('name', { name: 'Spaghetti Carbonara' });

      await waitFor(() =>
        expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument(),
      );
    });

    it('shows step label update when onStepComplete fires for name', async () => {
      let capturedOnStepComplete: ((key: string, data: Record<string, unknown>) => void) | undefined;

      vi.mocked(createRecipeAction.execute).mockImplementationOnce(
        (_model, _ctx, runtime) => {
          capturedOnStepComplete = runtime.onStepComplete;
          return new Promise(() => {});
        },
      );

      renderScreen();
      fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'My recipe text' } });
      fireEvent.click(screen.getByText('Generate'));

      await waitFor(() => expect(screen.getByText('Generating name…')).toBeInTheDocument());

      capturedOnStepComplete?.('name', { name: 'Spaghetti Carbonara' });

      await waitFor(() =>
        expect(screen.getByText('Generating basic info…')).toBeInTheDocument(),
      );
    });
  });

  describe('result phase', () => {
    it('shows the result heading', async () => {
      await renderAndReachResult();
      expect(screen.getByText('Recipe Ready!')).toBeInTheDocument();
    });

    it('renders the recipe title from the proposal', async () => {
      await renderAndReachResult();
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    it('renders the recipe description', async () => {
      await renderAndReachResult();
      expect(screen.getByText('Classic Italian pasta dish')).toBeInTheDocument();
    });

    it('renders the category badge', async () => {
      await renderAndReachResult();
      const hasCategoryBadge = screen.getAllByTestId('badge').some((b) =>
        b.textContent?.includes('dinner'),
      );
      expect(hasCategoryBadge).toBe(true);
    });

    it('renders the cuisine badge', async () => {
      await renderAndReachResult();
      const hasCuisineBadge = screen.getAllByTestId('badge').some((b) =>
        b.textContent?.includes('Italian'),
      );
      expect(hasCuisineBadge).toBe(true);
    });

    it('renders time info', async () => {
      await renderAndReachResult();
      expect(screen.getByText(/Prep 10m/)).toBeInTheDocument();
      expect(screen.getByText(/Cook 20m/)).toBeInTheDocument();
    });

    it('renders servings info', async () => {
      await renderAndReachResult();
      expect(screen.getByText(/4 servings/)).toBeInTheDocument();
    });

    it('renders ingredient names', async () => {
      await renderAndReachResult();
      expect(screen.getByText('Pasta')).toBeInTheDocument();
      expect(screen.getByText('Eggs')).toBeInTheDocument();
    });

    it('renders Create Recipe and Repaste buttons', async () => {
      await renderAndReachResult();
      expect(screen.getByText('✓ Create Recipe')).toBeInTheDocument();
      expect(screen.getByText('Repaste')).toBeInTheDocument();
    });

    it('renders the back link', async () => {
      await renderAndReachResult();
      expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
    });

    it('renders instruction steps', async () => {
      await renderAndReachResult();
      expect(screen.getByText('Boil pasta')).toBeInTheDocument();
      expect(screen.getByText('Mix eggs')).toBeInTheDocument();
    });
  });
});
