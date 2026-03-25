import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { HOUSEHOLD_SIZE_OPTIONS } from '@lib/userProfile';
import type { StepProps } from './types';

export function StepHousehold({ formData, update, next, skip }: StepProps) {
  const selected = formData.householdSize ?? null;

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>
          How many people are you cooking for?
        </h2>
        <p className='text-muted-foreground text-sm'>This helps us size recipe servings.</p>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {HOUSEHOLD_SIZE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type='button'
            onClick={() => update({ householdSize: opt.value })}
            className={join(
              'rounded-xl border p-4 text-center transition-colors',
              selected === opt.value
                ? 'bg-primary/10 border-primary'
                : 'bg-background border-border hover:bg-muted',
            )}
          >
            <p className='text-foreground text-base font-semibold'>{opt.label}</p>
          </button>
        ))}
      </div>

      <div className='flex gap-3'>
        <Button variant='primary' onClick={next} disabled={selected === null}>
          Next
        </Button>
        <Button variant='secondary' onClick={skip}>
          Skip
        </Button>
      </div>
    </div>
  );
}
