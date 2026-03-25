import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { COOKING_GOAL_OPTIONS } from '@lib/userProfile';
import type { CookingGoal } from '@lib/userProfile';
import type { StepProps } from './types';

export function StepGoal({ formData, update, next, skip }: StepProps) {
  const selected = formData.cookingGoal ?? null;

  const toggle = (value: CookingGoal) => {
    update({ cookingGoal: selected === value ? null : value });
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>What brings you here?</h2>
        <p className='text-muted-foreground text-sm'>Pick the one that fits best.</p>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {COOKING_GOAL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type='button'
            onClick={() => toggle(opt.value)}
            className={join(
              'rounded-xl border p-4 text-left transition-colors',
              selected === opt.value
                ? 'bg-primary/10 border-primary'
                : 'bg-background border-border hover:bg-muted',
            )}
          >
            <p className='text-foreground text-sm font-medium'>{opt.label}</p>
            <p className='text-muted-foreground mt-0.5 text-xs'>{opt.description}</p>
          </button>
        ))}
      </div>

      <div className='flex gap-3'>
        <Button variant='primary' onClick={next} disabled={!selected}>
          Next
        </Button>
        <Button variant='secondary' onClick={skip}>
          Skip
        </Button>
      </div>
    </div>
  );
}
