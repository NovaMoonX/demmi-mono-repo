import { join } from '@moondreamsdev/dreamer-ui/utils';
import { SKILL_LEVEL_OPTIONS } from '@lib/userProfile';
import type { StepProps } from './types';

export function StepSkill({ formData, update }: StepProps) {
  const selected = formData.skillLevel ?? null;

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>
          How confident are you in the kitchen?
        </h2>
      </div>

      <div className='grid grid-cols-1 gap-3'>
        {SKILL_LEVEL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type='button'
            onClick={() => update({ skillLevel: opt.value })}
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
