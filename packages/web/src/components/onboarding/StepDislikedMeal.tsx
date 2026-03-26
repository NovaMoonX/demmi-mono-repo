import { useState } from 'react';
import { Textarea } from '@moondreamsdev/dreamer-ui/components';
import type { StepProps } from './types';

export function StepDislikedMeal({ formData, update }: StepProps) {
  const [value, setValue] = useState(formData.dislikedMealDescription ?? '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    update({ dislikedMealDescription: e.target.value || null });
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>What's a meal you didn't enjoy?</h2>
        <p className='text-muted-foreground text-sm'>
          Even if it fits your goals — what just didn't work for you?
        </p>
      </div>

      <Textarea
        id='disliked-meal'
        placeholder='e.g. Plain boiled chicken with no seasoning — too bland and dry…'
        value={value}
        onChange={handleChange}
        rows={4}
      />
    </div>
  );
}
