import { useState, useRef } from 'react';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { DIETARY_RESTRICTION_OPTIONS } from '@lib/userProfile';
import type { DietaryRestriction } from '@lib/userProfile';
import type { StepProps } from './types';

const DIETARY_AVOID_MAP: Partial<Record<DietaryRestriction, string[]>> = {
  vegetarian: ['meat', 'poultry', 'fish', 'seafood'],
  vegan: ['meat', 'poultry', 'fish', 'seafood', 'dairy', 'eggs', 'honey'],
  'gluten-free': ['wheat', 'barley', 'rye', 'gluten'],
  'dairy-free': ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
  halal: ['pork', 'alcohol', 'lard'],
  kosher: ['pork', 'shellfish', 'mixing meat and dairy'],
  'nut-free': ['nuts', 'peanuts', 'tree nuts'],
};

function ChipToggle({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onToggle}
      className={join(
        'rounded-full border px-3 py-1 text-sm transition-colors',
        selected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-foreground border-border hover:bg-muted',
      )}
    >
      {label}
    </button>
  );
}

export function StepDietary({ formData, update }: StepProps) {
  const restrictions = formData.dietaryRestrictions ?? [];
  const avoidIngredients = formData.avoidIngredients ?? [];

  const [showAvoidInput, setShowAvoidInput] = useState(false);
  const [avoidInput, setAvoidInput] = useState('');
  const avoidRef = useRef<HTMLInputElement>(null);

  const isDietarySelected = (value: DietaryRestriction) => restrictions.includes(value);

  const toggleDietary = (value: DietaryRestriction) => {
    let nextRestrictions: DietaryRestriction[];
    let nextAvoid = [...avoidIngredients];

    if (isDietarySelected(value)) {
      nextRestrictions = restrictions.filter((r) => r !== value);
      const toRemove = DIETARY_AVOID_MAP[value] ?? [];
      nextAvoid = nextAvoid.filter((a) => !toRemove.includes(a));
    } else {
      nextRestrictions = [...restrictions, value];
      const toAdd = DIETARY_AVOID_MAP[value] ?? [];
      toAdd.forEach((item) => {
        if (!nextAvoid.includes(item)) nextAvoid.push(item);
      });
    }

    update({ dietaryRestrictions: nextRestrictions, avoidIngredients: nextAvoid });
  };

  const handleAvoidKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && avoidInput.trim()) {
      e.preventDefault();
      const trimmed = avoidInput.trim();
      if (!avoidIngredients.includes(trimmed)) {
        update({ avoidIngredients: [...avoidIngredients, trimmed] });
      }
      setAvoidInput('');
    }
  };

  const removeAvoid = (item: string) => {
    update({ avoidIngredients: avoidIngredients.filter((a) => a !== item) });
  };

  const handleShowAvoidInput = () => {
    setShowAvoidInput(true);
    setTimeout(() => avoidRef.current?.focus(), 0);
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>Any dietary preferences?</h2>
        <p className='text-muted-foreground text-sm'>Select all that apply.</p>
      </div>

      <div className='flex flex-wrap gap-2'>
        {DIETARY_RESTRICTION_OPTIONS.map((opt) => (
          <ChipToggle
            key={opt.value}
            label={opt.label}
            selected={isDietarySelected(opt.value)}
            onToggle={() => toggleDietary(opt.value)}
          />
        ))}
      </div>

      {avoidIngredients.length > 0 && (
        <div className='space-y-1.5'>
          <p className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
            Ingredients to avoid
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {avoidIngredients.map((item) => (
              <span
                key={item}
                className='bg-muted text-foreground flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm'
              >
                {item}
                <button
                  type='button'
                  onClick={() => removeAvoid(item)}
                  className='text-muted-foreground hover:text-foreground ml-0.5'
                  aria-label={`Remove ${item}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className='space-y-2'>
        {!showAvoidInput ? (
          <button
            type='button'
            onClick={handleShowAvoidInput}
            className='text-muted-foreground hover:text-foreground text-sm underline transition-colors'
          >
            Have other ingredients you want to avoid?
          </button>
        ) : (
          <div className='space-y-2'>
            <p className='text-muted-foreground text-xs'>
              Type an ingredient and press Enter to add it.
            </p>
            <Input
              ref={avoidRef}
              id='avoid-input'
              placeholder='e.g. shellfish, cilantro…'
              value={avoidInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAvoidInput(e.target.value)
              }
              onKeyDown={handleAvoidKeyDown}
            />
          </div>
        )}
      </div>
    </div>
  );
}
