import { join } from '@moondreamsdev/dreamer-ui/utils';
import type { CookTimePreference } from '@lib/userProfile';
import type { StepProps } from './types';

const COOK_TIME_OPTIONS: { value: CookTimePreference; label: string }[] = [
  { value: 'under-20', label: '⚡ Under 20 mins' },
  { value: '30-min', label: '🕐 Around 30 mins' },
  { value: 'under-an-hour', label: '⏳ Under an hour' },
  { value: 'any', label: '🍲 Happy to take my time' },
];

export function StepCookTime({ formData, update }: StepProps) {
  const selected = formData.cookTimePreference ?? null;

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>
          How much time do you usually have to cook?
        </h2>
      </div>

      <div className='grid grid-cols-1 gap-3'>
        {COOK_TIME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type='button'
            onClick={() => update({ cookTimePreference: opt.value })}
            className={join(
              'rounded-xl border p-4 text-left transition-colors',
              selected === opt.value
                ? 'bg-primary/10 border-primary'
                : 'bg-background border-border hover:bg-muted',
            )}
          >
            <p className='text-foreground text-sm font-medium'>{opt.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
