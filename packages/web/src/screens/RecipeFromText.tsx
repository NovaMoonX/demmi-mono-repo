import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Textarea,
  Button,
  Label,
  Badge,
  Card,
} from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { OllamaModelControl } from '@components/chat/OllamaModelControl';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { createIngredient } from '@store/actions/ingredientActions';
import { createRecipe } from '@store/actions/recipeActions';
import { createShoppingListItem } from '@store/actions/shoppingListActions';
import { createRecipeAction } from '@lib/ollama/actions';
import type { Recipe, RecipeCategory } from '@lib/recipes';
import { RECIPE_CATEGORY_COLORS, RECIPE_CATEGORY_EMOJIS } from '@lib/recipes';
import { INGREDIENT_TYPE_EMOJIS } from '@lib/ingredients';
import type {
  AgentRecipeProposal,
  AgentPartialRecipe,
  AgentIngredientProposal,
  CreateRecipeAgentActionStatus,
} from '@lib/ollama/action-types/createRecipeAction.types';
import type { RecipeStep } from '@lib/ollama/action-types/createRecipeAction.types';
import type { RecipeIngredient } from '@lib/recipes';
import { generatedId } from '@utils/generatedId';
import { ChatMessage } from '@/lib/chat';

type ScreenPhase = 'paste' | 'generating' | 'result';

const STEP_LABELS: Partial<Record<CreateRecipeAgentActionStatus, string>> = {
  generating_name: 'Generating name…',
  generating_info: 'Generating basic info…',
  generating_description: 'Generating description…',
  generating_ingredients: 'Generating ingredients…',
  generating_instructions: 'Generating instructions…',
};

const STEP_STATUS_MAP: Partial<
  Record<RecipeStep, CreateRecipeAgentActionStatus>
> = {
  name: 'generating_info',
  info: 'generating_description',
  description: 'generating_ingredients',
  ingredients: 'generating_instructions',
};

const EMPTY_PARTIAL_RECIPE: AgentPartialRecipe = {
  name: null,
  category: null,
  servings: null,
  totalTime: null,
  description: null,
  ingredients: null,
  instructions: null,
};

function PartialRecipePreview({ recipe }: { recipe: AgentPartialRecipe }) {
  const showCategory = recipe.category != null;
  const showDescription =
    recipe.description != null && recipe.description !== '';
  const showIngredients =
    recipe.ingredients != null && recipe.ingredients.length > 0;
  const showInstructions =
    recipe.instructions != null && recipe.instructions.length > 0;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          {recipe.name && (
            <h4 className='text-foreground text-base font-semibold'>
              {recipe.name}
            </h4>
          )}
          {showDescription && (
            <p className='text-muted-foreground mt-0.5 line-clamp-3 text-sm'>
              {recipe.description}
            </p>
          )}
        </div>
        {showCategory && (
          <span className='shrink-0 text-2xl'>
            {RECIPE_CATEGORY_EMOJIS[recipe.category as RecipeCategory]}
          </span>
        )}
      </div>
      {showCategory && (
        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant='base'
            className={join(
              'capitalize',
              RECIPE_CATEGORY_COLORS[recipe.category as RecipeCategory],
            )}
          >
            {recipe.category}
          </Badge>
          {recipe.totalTime != null && (
            <span className='text-muted-foreground text-xs'>
              {recipe.totalTime}m total
            </span>
          )}
          {recipe.servings != null && (
            <span className='text-muted-foreground text-xs'>
              {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
            </span>
          )}
        </div>
      )}
      {showIngredients && (
        <div className='flex flex-col gap-1.5'>
          <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
            Ingredients
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {recipe.ingredients!.map((ing, i) => (
              <div
                key={i}
                className='bg-muted text-muted-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs'
              >
                <span className='font-medium'>{ing.name}</span>
                <span className='opacity-70'>{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {showInstructions && (
        <div className='text-muted-foreground text-xs'>
          {recipe.instructions!.length} instruction{' '}
          {recipe.instructions!.length === 1 ? 'step' : 'steps'}
        </div>
      )}
    </div>
  );
}

function RecipeProposalCard({ recipe }: { recipe: AgentRecipeProposal }) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Card className='overflow-hidden'>
      <div className='flex flex-col gap-3 p-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <h4 className='text-foreground text-base font-semibold'>
              {recipe.title}
            </h4>
            <p className='text-muted-foreground mt-0.5 line-clamp-3 text-sm'>
              {recipe.description}
            </p>
          </div>
          <span className='shrink-0 text-2xl'>
            {RECIPE_CATEGORY_EMOJIS[recipe.category]}
          </span>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant='base'
            className={join(
              'capitalize',
              RECIPE_CATEGORY_COLORS[recipe.category],
            )}
          >
            {recipe.category}
          </Badge>
          <span className='text-muted-foreground text-xs'>
            Prep {recipe.prepTime}m · Cook {recipe.cookTime}m · {totalTime}m
            total
          </span>
          <span className='text-muted-foreground text-xs'>
            {recipe.servingSize}{' '}
            {recipe.servingSize === 1 ? 'serving' : 'servings'}
          </span>
        </div>
        {recipe.ingredients.length > 0 && (
          <IngredientProposalList ingredients={recipe.ingredients} />
        )}
        {recipe.instructions.length > 0 && (
          <div className='flex flex-col gap-1.5'>
            <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
              Instructions
            </p>
            <ol className='flex flex-col gap-1'>
              {recipe.instructions.map((step, i) => (
                <li key={i} className='text-foreground flex gap-2 text-sm'>
                  <span className='text-muted-foreground shrink-0 font-medium'>
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Card>
  );
}

function IngredientProposalList({
  ingredients,
}: {
  ingredients: AgentIngredientProposal[];
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
        Ingredients
      </p>
      <div className='flex flex-wrap gap-1.5'>
        {ingredients.map((ing, i) => (
          <div
            key={i}
            className={join(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs',
              ing.isNew
                ? 'bg-primary/10 text-primary ring-primary/30 ring-1'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <span>{INGREDIENT_TYPE_EMOJIS[ing.type]}</span>
            <span className='font-medium'>{ing.name}</span>
            <span className='opacity-70'>
              {ing.servings} {ing.unit}
            </span>
            {ing.isNew && (
              <span className='bg-primary/20 text-primary rounded px-1 py-0.5 text-xs leading-none font-semibold'>
                new
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecipeFromText() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { confirm } = useActionModal();
  const selectedModel = useAppSelector((state) => state.chats.selectedModel);

  const [recipeText, setRecipeText] = useState('');
  const [phase, setPhase] = useState<ScreenPhase>('paste');
  const [generatingStatus, setGeneratingStatus] =
    useState<CreateRecipeAgentActionStatus>('generating_name');
  const [partialRecipe, setPartialRecipe] = useState<AgentPartialRecipe | null>(
    null,
  );
  const [proposal, setProposal] = useState<AgentRecipeProposal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null);
  const [shoppingListPhase, setShoppingListPhase] = useState<
    'idle' | 'prompt' | 'adding' | 'done'
  >('idle');
  const [ingredientsAddedCount, setIngredientsAddedCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!recipeText.trim() || !selectedModel) return;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setPhase('generating');
    setGeneratingStatus('generating_name');
    setPartialRecipe({ ...EMPTY_PARTIAL_RECIPE });

    const fakeMessageId = generatedId('msg');
    const messages: ChatMessage[] = [
      {
        id: fakeMessageId,
        role: 'user' as const,
        content: recipeText,
        timestamp: Date.now(),
        model: null,
        rawContent: recipeText,
        agentAction: null,
        summary: null,
        iterationInvalid: false,
      },
    ];

    try {
      const result = await createRecipeAction.execute(
        selectedModel,
        { messages },
        {
          abortSignal: abortController.signal,
          onStepComplete: (key, data) => {
            const recipeKey = key as RecipeStep;
            setPartialRecipe((prev) => ({
              ...(prev ?? { ...EMPTY_PARTIAL_RECIPE }),
              ...(data as Partial<AgentPartialRecipe>),
            }));
            const nextStatus = STEP_STATUS_MAP[recipeKey];
            if (nextStatus) {
              setGeneratingStatus(nextStatus);
            }
          },
        },
      );

      if (result.cancelled) {
        setPhase('paste');
        setPartialRecipe(null);
      } else if (result.data.proposal) {
        setProposal(result.data.proposal);
        setPhase('result');
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        const errMsg =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        addToast({
          title: 'Generation failed',
          description: errMsg,
          type: 'error',
        });
        setPhase('paste');
        setPartialRecipe(null);
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const handleRepaste = async () => {
    const confirmed = await confirm({
      title: 'Discard this recipe?',
      message:
        "You'll return to the text input and need to generate again. This recipe will be lost.",
      confirmText: 'Yes, repaste',
      cancelText: 'Keep recipe',
    });
    if (!confirmed) return;

    setPhase('paste');
    setPartialRecipe(null);
    setProposal(null);
  };

  const handleCreateRecipe = async () => {
    if (!proposal) return;

    setIsSaving(true);
    const recipeIngredients: RecipeIngredient[] = [];
    let newlySavedRecipeId: string | null = null;

    try {
      for (const ingredientProposal of proposal.ingredients) {
        if (
          !ingredientProposal.isNew &&
          ingredientProposal.existingIngredientId
        ) {
          recipeIngredients.push({
            ingredientId: ingredientProposal.existingIngredientId,
            servings: ingredientProposal.servings,
          });
        } else {
          const created = await dispatch(
            createIngredient({
              name: ingredientProposal.name,
              type: ingredientProposal.type,
              unit: ingredientProposal.unit,
              imageUrl: '',
              nutrients: {
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0,
                calories: 0,
              },
              currentAmount: 0,
              servingSize: 1,
              otherUnit: null,
              products: [],
              defaultProductId: null,
              barcode: null,
            }),
          ).unwrap();

          recipeIngredients.push({
            ingredientId: created.id,
            servings: ingredientProposal.servings,
          });
        }
      }

      const recipe: Omit<Recipe, 'id' | 'userId'> = {
        title: proposal.title,
        description: proposal.description,
        category: proposal.category,
        
        prepTime: proposal.prepTime,
        cookTime: proposal.cookTime,
        servingSize: proposal.servingSize,
        instructions: proposal.instructions,
        imageUrl: proposal.imageUrl,
        ingredients: recipeIngredients,
        share: null,
      };

      const savedRecipe = await dispatch(createRecipe(recipe)).unwrap();

      newlySavedRecipeId = savedRecipe.id;

      addToast({
        title: 'Recipe saved!',
        description: `"${proposal.title}" has been added to your collection.`,
        type: 'success',
      });
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      addToast({ title: 'Failed to save', description: errMsg, type: 'error' });
    } finally {
      if (newlySavedRecipeId) {
        setSavedRecipeId(newlySavedRecipeId);
        setShoppingListPhase('prompt');
        setIsSaving(false);
      } else {
        setIsSaving(false);
      }
    }
  };

  const handleAddIngredientsToShoppingList = async () => {
    if (!proposal) return;
    setShoppingListPhase('adding');

    let itemsAdded = 0;
    for (const ing of proposal.ingredients) {
      try {
        await dispatch(
          createShoppingListItem({
            name: ing.name,
            ingredientId: ing.existingIngredientId ?? null,
            productId: null,
            amount: ing.servings,
            unit: ing.unit,
            category: ing.type,
            note: `For ${proposal.title}`,
            checked: false,
          }),
        ).unwrap();
        itemsAdded++;
      } catch {
        // Continue adding remaining items even if one fails (e.g. duplicates)
      }
    }

    setIngredientsAddedCount(itemsAdded);
    setShoppingListPhase('done');
  };

  const handleSkipShoppingList = () => {
    setShoppingListPhase('done');
  };

  if (phase === 'generating') {
    const stepLabel = STEP_LABELS[generatingStatus] ?? 'Generating recipe…';
    const hasPartialData =
      partialRecipe?.name != null && partialRecipe.name !== '';

    return (
      <div className='mx-auto mt-10 max-w-2xl p-6 md:mt-0'>
        <div className='mb-8'>
          <Link
            to='/recipes'
            className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
          >
            ← Back to Recipes
          </Link>
          <h1 className='text-foreground mb-2 text-4xl font-bold'>
            Generating Recipe…
          </h1>
          <p className='text-muted-foreground'>
            Please wait while we process your recipe text.
          </p>
        </div>

        <div className='border-border bg-card/50 flex flex-col gap-3 rounded-xl border p-4'>
          {hasPartialData && partialRecipe && (
            <PartialRecipePreview recipe={partialRecipe} />
          )}
          <div className='flex items-center gap-3'>
            <div className='text-muted-foreground flex gap-1'>
              <span className='animate-bounce text-sm'>●</span>
              <span className='animate-bounce text-sm [animation-delay:0.15s]'>
                ●
              </span>
              <span className='animate-bounce text-sm [animation-delay:0.3s]'>
                ●
              </span>
            </div>
            <p className='text-muted-foreground text-xs'>{stepLabel}</p>
          </div>
        </div>

        <div className='mt-6'>
          <Button variant='secondary' onClick={handleStop}>
            Stop
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'result' && proposal) {
    const isSaved = shoppingListPhase !== 'idle';
    const isAddingToList = shoppingListPhase === 'adding';

    return (
      <div className='mx-auto mt-10 max-w-2xl p-6 md:mt-0'>
        <div className='mb-8'>
          <Link
            to='/recipes'
            className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
          >
            ← Back to Recipes
          </Link>
          <h1 className='text-foreground mb-2 text-4xl font-bold'>
            {isSaved ? 'Recipe Created!' : 'Recipe Ready!'}
          </h1>
          <p className='text-muted-foreground'>
            {isSaved
              ? 'Your recipe has been saved to your collection.'
              : 'Review your recipe below, then save it to your collection.'}
          </p>
        </div>

        <div className='flex flex-col gap-6'>
          <RecipeProposalCard recipe={proposal} />

          {shoppingListPhase === 'prompt' && (
            <div className='border-border flex flex-col gap-3 rounded-xl border p-4'>
              <p className='text-foreground text-sm font-medium'>
                🛒 Would you like to add the ingredients to your shopping list?
              </p>
              <div className='flex gap-3'>
                <Button
                  variant='primary'
                  className='flex-1'
                  onClick={handleAddIngredientsToShoppingList}
                  disabled={isAddingToList}
                >
                  Yes, add them
                </Button>
                <Button
                  variant='secondary'
                  className='flex-1'
                  onClick={handleSkipShoppingList}
                  disabled={isAddingToList}
                >
                  No thanks
                </Button>
              </div>
            </div>
          )}

          {shoppingListPhase === 'done' && (
            <div className='flex flex-col gap-3'>
              {ingredientsAddedCount > 0 && (
                <div className='border-border bg-card/50 flex items-center justify-between gap-3 rounded-xl border px-4 py-3'>
                  <p className='text-foreground text-sm'>
                    🛒 Added {ingredientsAddedCount} ingredient
                    {ingredientsAddedCount === 1 ? '' : 's'} to your shopping
                    list
                  </p>
                  <Button
                    variant='tertiary'
                    size='sm'
                    onClick={() => navigate('/shopping-list')}
                  >
                    View list →
                  </Button>
                </div>
              )}
              <div className='flex gap-3'>
                <Button
                  variant='primary'
                  className='flex-1'
                  onClick={() => navigate(`/recipes/${savedRecipeId}`)}
                >
                  View Recipe
                </Button>
                <Button
                  variant='secondary'
                  className='flex-1'
                  onClick={() => navigate('/recipes')}
                >
                  Exit
                </Button>
              </div>
            </div>
          )}

          {shoppingListPhase === 'idle' && (
            <div className='flex gap-3'>
              <Button
                variant='primary'
                className='flex-1'
                onClick={handleCreateRecipe}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : '✓ Create Recipe'}
              </Button>
              <Button
                variant='secondary'
                className='flex-1'
                onClick={handleRepaste}
              >
                Repaste
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto mt-10 max-w-2xl p-6 md:mt-0'>
      <div className='mb-8'>
        <Link
          to='/recipes'
          className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
        >
          ← Back to Recipes
        </Link>
        <h1 className='text-foreground mb-2 text-4xl font-bold'>
          Paste Your Recipe
        </h1>
        <p className='text-muted-foreground'>
          Someone sent you a recipe? Paste the full text below and we'll take it
          from there.
        </p>
      </div>

      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-1.5'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='recipe-text'>Recipe Text</Label>
            {recipeText && (
              <Button
                variant='tertiary'
                size='sm'
                onClick={() => setRecipeText('')}
                aria-label='Clear recipe text'
              >
                Clear
              </Button>
            )}
          </div>
          <Textarea
            id='recipe-text'
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
            placeholder='Paste the recipe here — ingredients, instructions, all of it…'
            rows={16}
          />
        </div>

        <div className='flex justify-end'>
          <OllamaModelControl />
        </div>

        <div className='flex gap-3'>
          <Button
            variant='primary'
            className='flex-1'
            onClick={handleGenerate}
            disabled={recipeText.trim() === '' || !selectedModel}
          >
            Generate
          </Button>
          <Button
            variant='secondary'
            className='flex-1'
            onClick={() => navigate('/recipes')}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RecipeFromText;
