import {
  COOKING_GOAL_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
  SKILL_LEVEL_OPTIONS,
} from '@lib/userProfile';
import type { StepProfileSummaryProps } from './types';

const COOK_TIME_LABELS: Record<string, string> = {
  'under-20': 'Under 20 minutes',
  '30-min': 'Around 30 minutes',
  'under-an-hour': 'Under an hour',
  any: 'Happy to take my time',
};

interface SummaryRowProps {
  emoji: string;
  label: string;
  value: string;
}

function SummaryRow({ emoji, label, value }: SummaryRowProps) {
  return (
    <div className='flex items-start gap-3 px-4 py-3'>
      <span className='shrink-0 text-xl' aria-hidden>
        {emoji}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-muted-foreground text-xs uppercase tracking-wide'>{label}</p>
        <p className='text-foreground text-sm font-medium'>{value}</p>
      </div>
    </div>
  );
}

function getHouseholdLabel(household: number | null | undefined): string | null {
  if (household == null) return null;
  if (household === 1) return 'Just me';
  if (household === 2) return '2 people';
  if (household === 3) return '3–4 people';
  return '5+ people';
}

export function StepProfileSummary({ formData, aiLoading }: StepProfileSummaryProps) {
  const goals = formData.cookingGoal ?? [];
  const dietary = (formData.dietaryRestrictions ?? []).filter((d) => d !== 'no-restrictions');
  const cuisines = formData.cuisinePreferences ?? [];
  const skill = formData.skillLevel;
  const cookTime = formData.cookTimePreference;
  const household = formData.householdSize;

  const goalLabels = goals
    .map((g) => COOKING_GOAL_OPTIONS.find((o) => o.value === g)?.label ?? g)
    .join(', ');

  const dietaryLabels =
    dietary.length > 0
      ? dietary
          .map((d) => DIETARY_RESTRICTION_OPTIONS.find((o) => o.value === d)?.label ?? d)
          .join(', ')
      : null;

  const skillLabel = SKILL_LEVEL_OPTIONS.find((o) => o.value === skill)?.label ?? null;

  const cookTimeLabel = cookTime ? (COOK_TIME_LABELS[cookTime] ?? cookTime) : null;

  const householdLabel = getHouseholdLabel(household);

  const cuisineText =
    cuisines.length > 0
      ? cuisines.slice(0, 3).join(', ') +
        (cuisines.length > 3 ? ` +${cuisines.length - 3} more` : '')
      : null;

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>Here's what we know about you</h2>
        <p className='text-muted-foreground text-sm'>
          Demi is picking recipes based on all of this…
        </p>
      </div>

      <div className='bg-muted/40 border-border divide-border divide-y rounded-xl border'>
        {goalLabels && <SummaryRow emoji='🎯' label='Goals' value={goalLabels} />}
        {skillLabel && <SummaryRow emoji='👨‍🍳' label='Cooking level' value={skillLabel} />}
        {cookTimeLabel && <SummaryRow emoji='⏱️' label='Time available' value={cookTimeLabel} />}
        {householdLabel && <SummaryRow emoji='👥' label='Cooking for' value={householdLabel} />}
        {dietaryLabels && <SummaryRow emoji='🥦' label='Dietary' value={dietaryLabels} />}
        {cuisineText && <SummaryRow emoji='🌍' label='Cuisines' value={cuisineText} />}
      </div>

      <div
        className='border-border flex items-center gap-2.5 rounded-xl border px-4 py-3'
        role='status'
        aria-live='polite'
      >
        {aiLoading ? (
          <>
            <span className='animate-pulse text-lg' aria-hidden>
              ✨
            </span>
            <span className='text-muted-foreground text-sm'>
              Generating your personalized recipes…
            </span>
          </>
        ) : (
          <>
            <span className='text-lg' aria-hidden>
              🎉
            </span>
            <span className='text-foreground text-sm font-medium'>
              Your recipes are ready — tap Next to see them!
            </span>
          </>
        )}
      </div>
    </div>
  );
}
