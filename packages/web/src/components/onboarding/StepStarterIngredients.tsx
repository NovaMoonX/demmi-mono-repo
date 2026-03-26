import { useState, useRef } from 'react';
import { Input, Button } from '@moondreamsdev/dreamer-ui/components';
import type { StepProps } from './types';

export function StepStarterIngredients({ formData, update, next, skip }: StepProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const items = formData._starterIngredients ?? [];

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || items.includes(trimmed)) return;
    update({ _starterIngredients: [...items, trimmed] });
    setInputValue('');
    inputRef.current?.focus();
  };

  const removeItem = (item: string) => {
    update({ _starterIngredients: items.filter((i) => i !== item) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>
          Add a few ingredients you usually have
        </h2>
        <p className='text-muted-foreground text-sm'>
          This helps Demi suggest recipes you can actually make.
        </p>
      </div>

      <div className='flex gap-2'>
        <Input
          ref={inputRef}
          id='starter-ingredient-input'
          placeholder='e.g. eggs, olive oil…'
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant='secondary' onClick={addItem} type='button'>
          Add
        </Button>
      </div>

      {items.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {items.map((item) => (
            <span
              key={item}
              className='bg-muted text-foreground flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm'
            >
              {item}
              <button
                type='button'
                onClick={() => removeItem(item)}
                className='text-muted-foreground hover:text-foreground ml-0.5'
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className='flex items-center gap-3 pt-2'>
        <Button variant='primary' onClick={next} type='button'>
          Add to my kitchen
        </Button>
        <Button variant='tertiary' onClick={skip} type='button'>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
