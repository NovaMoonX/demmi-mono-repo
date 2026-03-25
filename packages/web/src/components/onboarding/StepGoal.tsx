import { join } from '@moondreamsdev/dreamer-ui/utils';
import { COOKING_GOAL_OPTIONS } from '@lib/userProfile';
import type { CookingGoal } from '@lib/userProfile';
import type { StepProps } from './types';

const MAX_GOALS = 2;

export function StepGoal({ formData, update }: StepProps) {
  const selected = formData.cookingGoal ?? [];

  const toggle = (value: CookingGoal) => {
    if (selected.includes(value)) {
      const result = selected.filter((g) => g !== value);
      update({ cookingGoal: result.length > 0 ? result : null });
    } else if (selected.length < MAX_GOALS) {
      update({ cookingGoal: [...selected, value] });
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>What brings you here?</h2>
        <p className='text-muted-foreground text-sm'>Pick up to {MAX_GOALS} that fit best.</p>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {COOKING_GOAL_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          const isDisabled = !isSelected && selected.length >= MAX_GOALS;
          return (
            <button
              key={opt.value}
              type='button'
              onClick={() => toggle(opt.value)}
              disabled={isDisabled}
              className={join(
                'rounded-xl border p-4 text-left transition-colors',
                isSelected
                  ? 'bg-primary/10 border-primary'
                  : 'bg-background border-border',
                isDisabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-muted',
              )}
            >
              <p className='text-foreground text-sm font-medium'>{opt.label}</p>
              <p className='text-muted-foreground mt-0.5 text-xs'>{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
