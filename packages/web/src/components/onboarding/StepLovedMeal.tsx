import { useState } from 'react';
import { Textarea } from '@moondreamsdev/dreamer-ui/components';
import type { StepProps } from './types';

export function StepLovedMeal({ formData, update }: StepProps) {
  const [value, setValue] = useState(formData.lovedMealDescription ?? '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    update({ lovedMealDescription: e.target.value || null });
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>Tell us about a meal you loved</h2>
        <p className='text-muted-foreground text-sm'>
          Think of something that felt satisfying, comforting, or just right — describe the vibe
          and what you enjoyed about it.
        </p>
      </div>

      <Textarea
        id='loved-meal'
        placeholder='e.g. A cozy, warming dish that felt hearty but not too heavy — just the right balance of flavours…'
        value={value}
        onChange={handleChange}
        rows={4}
      />
    </div>
  );
}
