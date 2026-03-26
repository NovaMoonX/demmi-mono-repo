import { useState } from 'react';
import { Input, Label } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import type { CookingGoalDetails } from '@lib/userProfile';
import type { StepProps } from './types';

const CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD'];
const MEAL_PREP_DAYS = [1, 2, 3, 4, 5, 6, 7];

export function StepGoalDetails({ formData, update }: StepProps) {
  const goals = formData.cookingGoal ?? [];
  const details = formData.cookingGoalDetails ?? ({} as Partial<CookingGoalDetails>);

  const hasMacros = goals.includes('track-macros');
  const hasBudget = goals.includes('save-money');
  const hasMealPrep = goals.includes('meal-prep');

  const macros = details['track-macros'] ?? { protein: 0, carbs: 0, fat: 0 };
  const budget = details['save-money'] ?? { weeklyBudget: 0, budgetCurrency: 'USD' };
  const mealPrep = details['meal-prep'] ?? { daysAhead: 1 };

  const [proteinInput, setProteinInput] = useState(macros.protein > 0 ? String(macros.protein) : '');
  const [carbsInput, setCarbsInput] = useState(macros.carbs > 0 ? String(macros.carbs) : '');
  const [fatInput, setFatInput] = useState(macros.fat > 0 ? String(macros.fat) : '');
  const [budgetInput, setBudgetInput] = useState(budget.weeklyBudget > 0 ? String(budget.weeklyBudget) : '');

  const updateMacros = (field: 'protein' | 'carbs' | 'fat', raw: string) => {
    const value = Number(raw) || 0;
    const next: CookingGoalDetails['track-macros'] = {
      protein: field === 'protein' ? value : Number(proteinInput) || 0,
      carbs: field === 'carbs' ? value : Number(carbsInput) || 0,
      fat: field === 'fat' ? value : Number(fatInput) || 0,
    };
    update({ cookingGoalDetails: { ...details, 'track-macros': next } as CookingGoalDetails });
  };

  const updateBudget = (weeklyBudget?: number, currency?: string) => {
    const next: CookingGoalDetails['save-money'] = {
      weeklyBudget: weeklyBudget ?? (Number(budgetInput) || 0),
      budgetCurrency: currency ?? budget.budgetCurrency,
    };
    update({ cookingGoalDetails: { ...details, 'save-money': next } as CookingGoalDetails });
  };

  const updateMealPrep = (days: number) => {
    update({
      cookingGoalDetails: {
        ...details,
        'meal-prep': { daysAhead: days },
      } as CookingGoalDetails,
    });
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>Let's set your targets</h2>
        <p className='text-muted-foreground text-sm'>Help us personalize your recommendations.</p>
      </div>

      {hasMacros && (
        <div className='space-y-4'>
          <p className='text-foreground text-base font-semibold'>📊 Daily macro targets</p>
          <div className='grid grid-cols-3 gap-3'>
            <div className='space-y-1'>
              <Label htmlFor='macro-protein'>Protein (g)</Label>
              <Input
                id='macro-protein'
                type='number'
                min={0}
                placeholder='150'
                value={proteinInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setProteinInput(e.target.value);
                  updateMacros('protein', e.target.value);
                }}
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='macro-carbs'>Carbs (g)</Label>
              <Input
                id='macro-carbs'
                type='number'
                min={0}
                placeholder='200'
                value={carbsInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCarbsInput(e.target.value);
                  updateMacros('carbs', e.target.value);
                }}
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='macro-fat'>Fat (g)</Label>
              <Input
                id='macro-fat'
                type='number'
                min={0}
                placeholder='65'
                value={fatInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFatInput(e.target.value);
                  updateMacros('fat', e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {hasBudget && (
        <div className='space-y-4'>
          <p className='text-foreground text-base font-semibold'>💸 Weekly grocery budget</p>
          <div className='space-y-3'>
            <div className='flex gap-2'>
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type='button'
                  onClick={() => updateBudget(undefined, c)}
                  className={join(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    budget.budgetCurrency === c
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border text-foreground hover:bg-muted',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <Input
              id='weekly-budget'
              type='number'
              min={0}
              placeholder='e.g. 100'
              value={budgetInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setBudgetInput(e.target.value);
                updateBudget(Number(e.target.value) || 0);
              }}
            />
          </div>
        </div>
      )}

      {hasMealPrep && (
        <div className='space-y-4'>
          <p className='text-foreground text-base font-semibold'>📦 How many days do you batch cook at once?</p>
          <div className='grid grid-cols-7 gap-2'>
            {MEAL_PREP_DAYS.map((d) => (
              <button
                key={d}
                type='button'
                onClick={() => updateMealPrep(d)}
                className={join(
                  'rounded-lg border py-2 text-center text-sm font-medium transition-colors',
                  mealPrep.daysAhead === d
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background border-border text-foreground hover:bg-muted',
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
