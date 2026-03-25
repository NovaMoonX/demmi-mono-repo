import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { RECIPE_CUISINE_OPTIONS } from '@lib/recipes';
import type { RecipeCuisineType } from '@lib/recipes';
import type { StepProps } from './types';

const MAX_CUISINES = 5;

export function StepCuisines({ formData, update, next, skip }: StepProps) {
  const selected = formData.cuisinePreferences ?? [];

  const toggle = (value: RecipeCuisineType) => {
    if (selected.includes(value)) {
      update({ cuisinePreferences: selected.filter((c) => c !== value) });
    } else if (selected.length < MAX_CUISINES) {
      update({ cuisinePreferences: [...selected, value] });
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>Favorite cuisines?</h2>
        <p className='text-muted-foreground text-sm'>Pick up to {MAX_CUISINES}.</p>
      </div>

      <div className='flex flex-wrap gap-2'>
        {RECIPE_CUISINE_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          const isDisabled = !isSelected && selected.length >= MAX_CUISINES;
          return (
            <button
              key={opt.value}
              type='button'
              onClick={() => toggle(opt.value)}
              disabled={isDisabled}
              className={join(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border',
                isDisabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-muted',
              )}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      <div className='flex gap-3'>
        <Button variant='primary' onClick={next}>
          Next
        </Button>
        <Button variant='secondary' onClick={skip}>
          Skip
        </Button>
      </div>
    </div>
  );
}
