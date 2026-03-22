import { useState } from 'react';
import { Link } from 'react-router-dom';
import { INGREDIENT_TYPE_EMOJIS } from '@lib/ingredients';
import type { MealCategory } from '@lib/meals';
import { MEAL_CATEGORY_COLORS, MEAL_CATEGORY_EMOJIS } from '@lib/meals';
import type {
  AgentIngredientProposal,
  AgentMealProposal,
  AgentPartialRecipe,
  CreateMealAgentActionStatus,
  MealIterableField,
} from '@lib/ollama/action-types/createMealAction.types';
import { Badge, Button, Card, Skeleton } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { GeneratingIndicator } from '../GeneratingIndicator';
import { AgentActionCardProps } from './types';

const GENERATING_STATUSES = new Set<CreateMealAgentActionStatus>([
  'generating_name',
  'generating_info',
  'generating_description',
  'generating_ingredients',
  'generating_instructions',
]);

const STEP_LABELS: Partial<Record<CreateMealAgentActionStatus, string>> = {
  generating_name: 'Generating name…',
  generating_info: 'Generating basic info…',
  generating_description: 'Generating description…',
  generating_ingredients: 'Generating ingredients…',
  generating_instructions: 'Generating instructions…',
};

const FIELD_LABELS: Record<MealIterableField, string> = {
  name: 'name',
  info: 'basic info',
  description: 'description',
  ingredients: 'ingredients',
  instructions: 'instructions',
};

function IteratingMealCard({
  meal,
  updatingFields,
}: {
  meal: AgentMealProposal;
  updatingFields: MealIterableField[];
}) {
  const totalTime = meal.prepTime + meal.cookTime;
  const updatingName = updatingFields.includes('name');
  const updatingInfo = updatingFields.includes('info');
  const updatingDescription = updatingFields.includes('description');
  const updatingIngredients = updatingFields.includes('ingredients');
  const updatingInstructions = updatingFields.includes('instructions');

  return (
    <Card className='overflow-hidden'>
      <div className='flex flex-col gap-3 p-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            {updatingName ? (
              <Skeleton shape='rectangle' className='h-5 w-40' />
            ) : (
              <h4 className='text-foreground text-base font-semibold'>{meal.title}</h4>
            )}
            {updatingDescription ? (
              <div className='mt-1.5 flex flex-col gap-1'>
                <Skeleton shape='rectangle' className='h-3.5 w-full' />
                <Skeleton shape='rectangle' className='h-3.5 w-3/4' />
              </div>
            ) : (
              <p className='text-muted-foreground mt-0.5 line-clamp-2 text-sm'>
                {meal.description}
              </p>
            )}
          </div>
          <span className='shrink-0 text-2xl'>
            {updatingInfo ? '…' : MEAL_CATEGORY_EMOJIS[meal.category]}
          </span>
        </div>

        {updatingInfo ? (
          <div className='flex flex-wrap gap-2'>
            <Skeleton shape='rectangle' className='h-5 w-16' />
            <Skeleton shape='rectangle' className='h-5 w-28' />
            <Skeleton shape='rectangle' className='h-5 w-20' />
          </div>
        ) : (
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='base'
              className={join('capitalize', MEAL_CATEGORY_COLORS[meal.category])}
            >
              {meal.category}
            </Badge>
            <span className='text-muted-foreground text-xs'>
              Prep {meal.prepTime}m · Cook {meal.cookTime}m · {totalTime}m total
            </span>
            <span className='text-muted-foreground text-xs'>
              {meal.servingSize} {meal.servingSize === 1 ? 'serving' : 'servings'}
            </span>
          </div>
        )}

        {updatingInstructions ? (
          <Skeleton shape='rectangle' className='h-3.5 w-36' />
        ) : (
          meal.instructions.length > 0 && (
            <div className='text-muted-foreground text-xs'>
              {meal.instructions.length} instruction{' '}
              {meal.instructions.length === 1 ? 'step' : 'steps'}
            </div>
          )
        )}

        {updatingIngredients ? (
          <div className='flex flex-col gap-1.5'>
            <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
              Ingredients
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {(['w-16', 'w-12', 'w-20', 'w-14', 'w-10'] as const).map((wClass, i) => (
                <Skeleton
                  key={i}
                  shape='rectangle'
                  className={join('h-6 rounded-md', wClass)}
                />
              ))}
            </div>
          </div>
        ) : (
          meal.ingredients.length > 0 && <IngredientList ingredients={meal.ingredients} />
        )}
      </div>
    </Card>
  );
}

function MealPreviewCard({ meal }: { meal: AgentMealProposal }) {
  const totalTime = meal.prepTime + meal.cookTime;

  return (
    <Card className='overflow-hidden'>
      <div className='flex flex-col gap-3 p-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <h4 className='text-foreground text-base font-semibold'>
              {meal.title}
            </h4>
            <p className='text-muted-foreground mt-0.5 line-clamp-2 text-sm'>
              {meal.description}
            </p>
          </div>
          <span className='shrink-0 text-2xl'>
            {MEAL_CATEGORY_EMOJIS[meal.category]}
          </span>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant='base'
            className={join('capitalize', MEAL_CATEGORY_COLORS[meal.category])}
          >
            {meal.category}
          </Badge>
          <span className='text-muted-foreground text-xs'>
            Prep {meal.prepTime}m · Cook {meal.cookTime}m · {totalTime}m total
          </span>
          <span className='text-muted-foreground text-xs'>
            {meal.servingSize} {meal.servingSize === 1 ? 'serving' : 'servings'}
          </span>
        </div>

        {meal.instructions.length > 0 && (
          <div className='text-muted-foreground text-xs'>
            {meal.instructions.length} instruction{' '}
            {meal.instructions.length === 1 ? 'step' : 'steps'}
          </div>
        )}

        {meal.ingredients.length > 0 && (
          <IngredientList ingredients={meal.ingredients} />
        )}
      </div>
    </Card>
  );
}

function IngredientList({
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
              <span className='bg-primary/20 text-primary rounded px-1 py-0.5 text-xs font-semibold leading-none'>
                new
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PartialIngredientList({
  ingredients,
}: {
  ingredients: Array<{ name: string; amount: string }>;
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
            className='bg-muted text-muted-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs'
          >
            <span className='font-medium'>{ing.name}</span>
            <span className='opacity-70'>{ing.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartialRecipeCard({ recipe }: { recipe: AgentPartialRecipe }) {
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
            {MEAL_CATEGORY_EMOJIS[recipe.category as MealCategory]}
          </span>
        )}
      </div>

      {showCategory && (
        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant='base'
            className={join(
              'capitalize',
              MEAL_CATEGORY_COLORS[recipe.category as MealCategory],
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
        <PartialIngredientList ingredients={recipe.ingredients ?? []} />
      )}

      {showInstructions && (
        <div className='text-muted-foreground text-xs'>
          {recipe.instructions?.length ?? 0} instruction{' '}
          {(recipe.instructions?.length ?? 0) === 1 ? 'step' : 'steps'}
        </div>
      )}
    </div>
  );
}

export function CreateMealAgentActionCard({
  action,
  onConfirmIntent,
  onRejectIntent,
  onApprove,
  onReject,
  onAddToShoppingList,
  onSkipShoppingList,
}: AgentActionCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  if (action.status === 'pending_confirmation') {
    const name =
      action.proposedName || (action.meals[0]?.title ?? 'this recipe');
    const mealCount = action.meals.length;

    return (
      <div className='border-border bg-card/50 mt-3 flex flex-col gap-3 rounded-xl border p-4'>
        <div className='flex items-start gap-3'>
          <span className='mt-0.5 text-xl'>🍽️</span>
          <div className='flex-1'>
            <p className='text-foreground text-sm'>
              Sounds like you want to create{' '}
              {mealCount > 1 ? `${mealCount} recipes` : 'a recipe'} for{' '}
              <span className='text-foreground font-semibold'>{name}</span>. Is
              that correct?
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='primary' size='sm' onClick={onConfirmIntent}>
            Yes, create it
          </Button>
          <Button variant='secondary' size='sm' onClick={onRejectIntent}>
            No, cancel
          </Button>
        </div>
        <p className='text-muted-foreground text-xs'>
          💬 Not quite right? Reply to adjust the details first.
        </p>
      </div>
    );
  }

  if (GENERATING_STATUSES.has(action.status)) {
    const name = (action.proposedName || action.recipe?.name) ?? 'your recipe';
    const stepLabel = STEP_LABELS[action.status] ?? 'Generating recipe…';
    const recipe = action.recipe;
    const hasPartialData = recipe?.name != null && recipe.name !== '';

    return (
      <div className='border-border bg-card/50 mt-3 flex flex-col gap-3 rounded-xl border p-4'>
        {hasPartialData && recipe && <PartialRecipeCard recipe={recipe} />}

        <div className='flex items-center gap-3'>
          <GeneratingIndicator />
          <div className='flex flex-col gap-0.5'>
            {!hasPartialData && (
              <p className='text-muted-foreground text-sm'>
                <span className='text-foreground font-medium'>{name}</span>
              </p>
            )}
            <p className='text-muted-foreground text-xs'>{stepLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  if (action.status === 'iterating') {
    const meal = action.meals[0];
    const updatingFields = action.updatingFields ?? [];

    const fieldNames = updatingFields.map((f) => FIELD_LABELS[f]).join(', ')
    const statusText = updatingFields.length > 0
      ? `Updating ${fieldNames}…`
      : undefined;

    return (
      <div className='border-border bg-card/50 mt-3 flex flex-col gap-3 rounded-xl border p-3'>
        <div className='flex items-center gap-2'>
          <GeneratingIndicator />
          {statusText && <span className='text-muted-foreground text-xs'>{statusText}</span>}
        </div>

        {meal && updatingFields.length > 0 && (
          <IteratingMealCard meal={meal} updatingFields={updatingFields} />
        )}
      </div>
    );
  }

  if (action.status === 'pending_approval') {
    return (
      <div className='border-border bg-card/50 mt-3 flex flex-col gap-3 rounded-xl border p-3'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>✅</span>
          <span className='text-foreground text-sm font-semibold'>
            {action.meals.length === 1
              ? 'Recipe ready'
              : `${action.meals.length} recipes ready`}{' '}
            — review before saving
          </span>
        </div>

        <div className='flex flex-col gap-2'>
          {action.meals.map((meal, i) => (
            <MealPreviewCard key={i} meal={meal} />
          ))}
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='primary' size='sm' onClick={onApprove}>
            ✓ Save to My Meals
          </Button>
          <Button variant='secondary' size='sm' onClick={onReject}>
            Decline
          </Button>
        </div>
        <p className='text-muted-foreground text-xs'>
          💬 Not quite right? Reply to adjust the details.
        </p>
      </div>
    );
  }

  if (action.status === 'stale') {
    return (
      <div className='border-border bg-card/50 mt-3 flex flex-col gap-3 rounded-xl border p-3 opacity-60'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>🕘</span>
          <span className='text-muted-foreground text-sm font-semibold'>
            Previous version (stale)
          </span>
        </div>

        <div className='flex flex-col gap-2'>
          {action.meals.map((meal, i) => (
            <MealPreviewCard key={i} meal={meal} />
          ))}
        </div>

        <p className='text-muted-foreground text-xs'>
          This proposal has been superseded by a newer iteration below.
        </p>
      </div>
    );
  }

  if (action.status === 'approved') {
    const decision = action.shoppingListDecision ?? null;
    const itemsAdded = action.shoppingListItemsAdded ?? 0;

    return (
      <div className='mt-3 flex flex-col gap-3 rounded-xl border border-green-500/30 bg-green-500/5 p-3'>
        <div className='flex items-center gap-2 px-1'>
          <span className='text-base text-green-600 dark:text-green-400'>✓</span>
          <span className='text-sm font-medium text-green-700 dark:text-green-400'>
            {action.meals.length === 1
              ? 'Meal saved'
              : `${action.meals.length} meals saved`}{' '}
            to your collection
          </span>
        </div>

        <div className='flex flex-col gap-2'>
          {action.meals.map((meal, i) => (
            <div key={i} className='flex items-start justify-between gap-2 px-1'>
              <div className='min-w-0 flex-1'>
                <h4 className='text-foreground text-sm font-semibold'>{meal.title}</h4>
                {meal.description && (
                  <p className='text-muted-foreground mt-0.5 line-clamp-2 text-xs'>
                    {meal.description}
                  </p>
                )}
              </div>
              <Badge
                variant='base'
                className={join('shrink-0 capitalize', MEAL_CATEGORY_COLORS[meal.category])}
              >
                {MEAL_CATEGORY_EMOJIS[meal.category]} {meal.category}
              </Badge>
            </div>
          ))}
        </div>

        {onAddToShoppingList && decision === null && (
          <div className='border-green-500/20 flex flex-col gap-2 border-t pt-2'>
            <p className='text-muted-foreground text-xs'>
              🛒 Would you like to add the ingredients to your shopping list?
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='secondary'
                size='sm'
                disabled={isAdding}
                onClick={async () => {
                  if (!onAddToShoppingList) return;
                  setIsAdding(true);
                  await onAddToShoppingList();
                  setIsAdding(false);
                }}
              >
                Yes, add them
              </Button>
              <Button
                variant='tertiary'
                size='sm'
                disabled={isAdding}
                onClick={() => onSkipShoppingList?.()}
              >
                No thanks
              </Button>
            </div>
          </div>
        )}

        {decision === 'added' && (
          <div className='border-green-500/20 flex items-center justify-between gap-2 border-t pt-2'>
            <p className='text-muted-foreground text-xs'>
              🛒 {itemsAdded} ingredient{itemsAdded === 1 ? '' : 's'} added to your shopping list
            </p>
            <Link
              to='/shopping-list'
              className='text-primary hover:text-primary/80 shrink-0 text-xs underline-offset-2 hover:underline'
            >
              View list →
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (action.status === 'rejected') {
    const meal = action.meals[0];
    const name = meal?.title ?? action.proposedName;
    const category = meal?.category;

    return (
      <div className='border-border bg-muted/30 mt-3 flex items-center gap-3 rounded-xl border px-4 py-3 opacity-50'>
        <span className='text-muted-foreground shrink-0 text-sm'>✕</span>
        <div className='min-w-0 flex-1'>
          {name && <p className='text-foreground truncate text-sm font-medium'>{name}</p>}
        </div>
        {category && (
          <Badge
            variant='base'
            className={join('shrink-0 capitalize', MEAL_CATEGORY_COLORS[category])}
          >
            {MEAL_CATEGORY_EMOJIS[category]} {category}
          </Badge>
        )}
        <span className='text-muted-foreground shrink-0 text-xs'>Declined</span>
      </div>
    );
  }

  if (action.status === 'cancelled') {
    const recipe = action.recipe;
    const hasPartialData = recipe?.name != null && recipe.name !== '';

    if (hasPartialData && recipe) {
      return (
        <div className='border-border bg-muted/30 mt-3 flex flex-col gap-3 rounded-xl border p-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm'>✕</span>
            <span className='text-muted-foreground text-sm'>
              Generation cancelled — partial recipe below
            </span>
          </div>
          <PartialRecipeCard recipe={recipe} />
        </div>
      );
    }

    return (
      <div className='border-border bg-muted/30 mt-3 flex items-center gap-2 rounded-xl border px-4 py-3'>
        <span className='text-muted-foreground text-sm'>
          Recipe generation was cancelled
        </span>
      </div>
    );
  }

  return null;
}
