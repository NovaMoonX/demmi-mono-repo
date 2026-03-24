import { Button, Badge } from '@moondreamsdev/dreamer-ui/components';
import type { UserProfile } from '@lib/userProfile';
import {
  DIETARY_RESTRICTION_OPTIONS,
  CUISINE_TYPE_OPTIONS,
  COOKING_GOAL_OPTIONS,
  HOUSEHOLD_SIZE_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  COOK_TIME_OPTIONS,
} from '@lib/userProfile';

interface ProfileViewModeProps {
  profile: UserProfile;
  onEdit: () => void;
  onResetOnboarding: () => void;
}

function ViewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4'>
      <span className='text-muted-foreground w-44 shrink-0 text-sm font-medium'>{label}</span>
      <div className='flex flex-wrap gap-1.5 text-sm'>{children}</div>
    </div>
  );
}

function EmptyValue() {
  return <span className='text-muted-foreground italic'>Not set</span>;
}

export function ProfileViewMode({ profile, onEdit, onResetOnboarding }: ProfileViewModeProps) {
  const dietaryLabels = profile.dietaryRestrictions.map(
    (r) => DIETARY_RESTRICTION_OPTIONS.find((o) => o.value === r)?.label ?? r,
  );
  const customLabels = profile.customDietaryRestrictions;

  const cuisineLabels = profile.cuisinePreferences.map(
    (c) => CUISINE_TYPE_OPTIONS.find((o) => o.value === c)?.label ?? c,
  );

  const goalOption = profile.cookingGoal
    ? COOKING_GOAL_OPTIONS.find((o) => o.value === profile.cookingGoal)
    : null;

  const householdLabel = HOUSEHOLD_SIZE_OPTIONS.find(
    (o) => o.value === profile.householdSize,
  )?.label ?? String(profile.householdSize);

  const skillLabel = profile.skillLevel
    ? SKILL_LEVEL_OPTIONS.find((o) => o.value === profile.skillLevel)?.label
    : null;

  const cookTimeLabel = profile.cookTimePreference
    ? COOK_TIME_OPTIONS.find((o) => o.value === profile.cookTimePreference)?.label
    : null;

  return (
    <div className='mx-auto max-w-2xl space-y-8 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-foreground text-2xl font-bold'>Account</h1>
          {profile.displayName && (
            <p className='text-muted-foreground mt-1 text-sm'>{profile.displayName}</p>
          )}
        </div>
        <Button variant='secondary' onClick={onEdit}>
          Edit profile
        </Button>
      </div>

      <div className='space-y-4'>
        <ViewRow label='Cooking goal'>
          {goalOption ? (
            <Badge>{goalOption.label}</Badge>
          ) : (
            <EmptyValue />
          )}
        </ViewRow>

        <ViewRow label='Household size'>
          <span className='text-foreground'>{householdLabel}</span>
        </ViewRow>

        <ViewRow label='Skill level'>
          {skillLabel ? (
            <span className='text-foreground'>{skillLabel}</span>
          ) : (
            <EmptyValue />
          )}
        </ViewRow>

        <ViewRow label='Cook time'>
          {cookTimeLabel ? (
            <span className='text-foreground'>{cookTimeLabel}</span>
          ) : (
            <EmptyValue />
          )}
        </ViewRow>

        <ViewRow label='Dietary restrictions'>
          {dietaryLabels.length === 0 && customLabels.length === 0 ? (
            <EmptyValue />
          ) : (
            <>
              {dietaryLabels.map((label) => (
                <Badge key={label}>{label}</Badge>
              ))}
              {customLabels.map((label) => (
                <Badge key={label}>{label}</Badge>
              ))}
            </>
          )}
        </ViewRow>

        <ViewRow label='Avoid ingredients'>
          {profile.avoidIngredients.length === 0 ? (
            <EmptyValue />
          ) : (
            profile.avoidIngredients.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))
          )}
        </ViewRow>

        <ViewRow label='Cuisine preferences'>
          {cuisineLabels.length === 0 ? (
            <EmptyValue />
          ) : (
            cuisineLabels.map((label) => (
              <Badge key={label}>{label}</Badge>
            ))
          )}
        </ViewRow>

        <ViewRow label='Pantry deduction'>
          <span className='text-foreground'>
            {profile.autoPantryDeduct === null
              ? 'Not set'
              : profile.autoPantryDeduct
                ? 'Auto-deduct enabled'
                : 'Auto-deduct disabled'}
          </span>
        </ViewRow>
      </div>

      <div className='border-border border-t pt-6'>
        <Button variant='destructive' onClick={onResetOnboarding}>
          Reset onboarding
        </Button>
      </div>
    </div>
  );
}
