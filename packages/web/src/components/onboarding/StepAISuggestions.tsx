import { useState } from 'react';
import { Button, Badge } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useAppDispatch } from '@store/hooks';
import { createRecipe } from '@store/actions/recipeActions';
import { RECIPE_CATEGORY_EMOJIS, RECIPE_CATEGORY_COLORS } from '@lib/recipes';
import type { StepAISuggestionsProps } from './types';

export function StepAISuggestions({ aiRecipes, aiLoading, next, skip }: StepAISuggestionsProps) {
  const dispatch = useAppDispatch();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const total = aiRecipes.length;
  const currentRecipe = aiRecipes[currentIdx];
  const isSaved = savedIndices.has(currentIdx);

  const saveRecipe = async (idx: number) => {
    const r = aiRecipes[idx];
    if (!r) return;
    await dispatch(
      createRecipe({
        title: r.title,
        description: r.description,
        category: r.category,
        cuisine: 'american',
        prepTime: 0,
        cookTime: 30,
        servingSize: 2,
        instructions: [],
        imageUrl: '',
        ingredients: [],
        share: null,
      }),
    );
    setSavedIndices((prev) => new Set(prev).add(idx));
  };

  const handleSaveCurrent = async () => {
    setIsSaving(true);
    await saveRecipe(currentIdx);
    setIsSaving(false);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    await Promise.all(
      aiRecipes.map((_, idx) => (savedIndices.has(idx) ? Promise.resolve() : saveRecipe(idx))),
    );
    setIsSaving(false);
    next();
  };

  if (aiLoading) {
    return (
      <div className='flex flex-col gap-6'>
        <div className='space-y-1'>
          <h2 className='text-foreground text-2xl font-bold'>
            Here are recipes we think you'll love
          </h2>
        </div>
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='bg-muted h-40 animate-pulse rounded-xl'
              aria-label='Loading recipe'
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>
          Here are recipes we think you'll love
        </h2>
      </div>

      <div className='flex items-center justify-between'>
        <button
          type='button'
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className={join(
            'rounded-lg border px-3 py-1.5 text-sm transition-colors',
            currentIdx === 0
              ? 'border-border text-muted-foreground cursor-not-allowed opacity-40'
              : 'border-border hover:bg-muted text-foreground',
          )}
          aria-label='Previous recipe'
        >
          ←
        </button>
        <span className='text-muted-foreground text-sm'>
          Recipe {currentIdx + 1} of {total}
        </span>
        <button
          type='button'
          onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}
          disabled={currentIdx === total - 1}
          className={join(
            'rounded-lg border px-3 py-1.5 text-sm transition-colors',
            currentIdx === total - 1
              ? 'border-border text-muted-foreground cursor-not-allowed opacity-40'
              : 'border-border hover:bg-muted text-foreground',
          )}
          aria-label='Next recipe'
        >
          →
        </button>
      </div>

      {currentRecipe && (
        <div className='bg-card border-border rounded-xl border p-5 shadow-sm'>
          <div className='mb-3 flex items-start gap-3'>
            <span className='shrink-0 text-3xl' aria-hidden>
              {RECIPE_CATEGORY_EMOJIS[currentRecipe.category] ?? '🍽️'}
            </span>
            <div className='min-w-0 flex-1'>
              <h3 className='text-foreground text-lg font-semibold leading-tight'>
                {currentRecipe.title}
              </h3>
              <Badge
                variant='base'
                className={join('mt-1 capitalize', RECIPE_CATEGORY_COLORS[currentRecipe.category])}
              >
                {currentRecipe.category}
              </Badge>
            </div>
            {isSaved && (
              <span className='text-sm font-medium text-emerald-600 dark:text-emerald-400'>
                ✓ Saved
              </span>
            )}
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {currentRecipe.description}
          </p>
        </div>
      )}

      <div className='flex items-center gap-3'>
        <Button
          variant='primary'
          onClick={handleSaveCurrent}
          disabled={isSaved || isSaving || !currentRecipe}
          type='button'
        >
          {isSaved ? '✓ Saved' : 'Save this recipe'}
        </Button>
        <Button
          variant='tertiary'
          onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}
          disabled={currentIdx === total - 1}
          type='button'
        >
          Skip this one
        </Button>
      </div>

      <div className='border-border flex items-center gap-3 border-t pt-4'>
        <Button variant='secondary' onClick={handleSaveAll} disabled={isSaving} type='button'>
          {isSaving ? 'Saving…' : 'Save all recipes'}
        </Button>
        <Button variant='tertiary' onClick={skip} disabled={isSaving} type='button'>
          Skip all
        </Button>
      </div>
    </div>
  );
}
