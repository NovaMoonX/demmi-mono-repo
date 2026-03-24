import { useState, useRef } from 'react';
import { Button, Input, Label, Toggle } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import type { UserProfile, CookingGoal, CookingSkillLevel, CookTimePreference, DietaryRestriction } from '@lib/userProfile';
import type { RecipeCuisineType } from '@lib/recipes';
import {
  DIETARY_RESTRICTION_OPTIONS,
  CUISINE_TYPE_OPTIONS,
  COOKING_GOAL_OPTIONS,
  HOUSEHOLD_SIZE_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  COOK_TIME_OPTIONS,
} from '@lib/userProfile';

interface ProfileEditFormProps {
  profile: UserProfile;
  saving: boolean;
  onSave: (updates: Partial<UserProfile>) => void;
  onCancel: () => void;
}

interface FormState {
  dietaryRestrictions: DietaryRestriction[];
  customDietaryRestrictions: string[];
  avoidIngredients: string[];
  cuisinePreferences: RecipeCuisineType[];
  cookingGoal: CookingGoal | null;
  householdSize: number;
  skillLevel: CookingSkillLevel | null;
  cookTimePreference: CookTimePreference | null;
  autoPantryDeduct: boolean | null;
}

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (val: T) => void;
}) {
  return (
    <div className='flex flex-wrap gap-2'>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type='button'
          onClick={() => onChange(opt.value)}
          className={join(
            'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
            value === opt.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:bg-muted',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

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

export function ProfileEditForm({ profile, saving, onSave, onCancel }: ProfileEditFormProps) {
  const [form, setForm] = useState<FormState>({
    dietaryRestrictions: profile.dietaryRestrictions,
    customDietaryRestrictions: profile.customDietaryRestrictions,
    avoidIngredients: profile.avoidIngredients,
    cuisinePreferences: profile.cuisinePreferences,
    cookingGoal: profile.cookingGoal,
    householdSize: profile.householdSize,
    skillLevel: profile.skillLevel,
    cookTimePreference: profile.cookTimePreference,
    autoPantryDeduct: profile.autoPantryDeduct,
  });

  const [otherDietaryInput, setOtherDietaryInput] = useState('');
  const [avoidInput, setAvoidInput] = useState('');
  const [showOtherChip, setShowOtherChip] = useState(
    profile.customDietaryRestrictions.length > 0,
  );
  const otherDietaryRef = useRef<HTMLInputElement>(null);
  const avoidInputRef = useRef<HTMLInputElement>(null);

  const isDietarySelected = (value: DietaryRestriction) =>
    form.dietaryRestrictions.includes(value);

  const toggleDietary = (value: DietaryRestriction) => {
    const result = isDietarySelected(value)
      ? form.dietaryRestrictions.filter((r) => r !== value)
      : [...form.dietaryRestrictions, value];
    setForm((prev) => ({ ...prev, dietaryRestrictions: result }));
  };

  const handleOtherDietaryToggle = () => {
    const result = !showOtherChip;
    setShowOtherChip(result);
    if (!result) {
      setForm((prev) => ({ ...prev, customDietaryRestrictions: [] }));
      setOtherDietaryInput('');
    } else {
      setTimeout(() => otherDietaryRef.current?.focus(), 0);
    }
  };

  const handleOtherDietaryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && otherDietaryInput.trim()) {
      e.preventDefault();
      const trimmed = otherDietaryInput.trim();
      if (!form.customDietaryRestrictions.includes(trimmed)) {
        setForm((prev) => ({
          ...prev,
          customDietaryRestrictions: [...prev.customDietaryRestrictions, trimmed],
        }));
      }
      setOtherDietaryInput('');
    }
  };

  const removeCustomDietary = (item: string) => {
    setForm((prev) => ({
      ...prev,
      customDietaryRestrictions: prev.customDietaryRestrictions.filter((r) => r !== item),
    }));
  };

  const handleAvoidKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && avoidInput.trim()) {
      e.preventDefault();
      const trimmed = avoidInput.trim();
      if (!form.avoidIngredients.includes(trimmed)) {
        setForm((prev) => ({
          ...prev,
          avoidIngredients: [...prev.avoidIngredients, trimmed],
        }));
      }
      setAvoidInput('');
    }
  };

  const removeAvoid = (item: string) => {
    setForm((prev) => ({
      ...prev,
      avoidIngredients: prev.avoidIngredients.filter((r) => r !== item),
    }));
  };

  const isCuisineSelected = (value: RecipeCuisineType) =>
    form.cuisinePreferences.includes(value);

  const toggleCuisine = (value: RecipeCuisineType) => {
    const result = isCuisineSelected(value)
      ? form.cuisinePreferences.filter((c) => c !== value)
      : [...form.cuisinePreferences, value];
    setForm((prev) => ({ ...prev, cuisinePreferences: result }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      dietaryRestrictions: form.dietaryRestrictions,
      customDietaryRestrictions: form.customDietaryRestrictions,
      avoidIngredients: form.avoidIngredients,
      cuisinePreferences: form.cuisinePreferences,
      cookingGoal: form.cookingGoal,
      householdSize: form.householdSize,
      skillLevel: form.skillLevel,
      cookTimePreference: form.cookTimePreference,
      autoPantryDeduct: form.autoPantryDeduct,
    });
  };

  return (
    <form onSubmit={handleSubmit} className='mx-auto max-w-2xl space-y-8 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-foreground text-2xl font-bold'>Edit profile</h1>
      </div>

      <div className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='cooking-goal'>Cooking goal</Label>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            {COOKING_GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type='button'
                onClick={() =>
                  setForm((prev) => ({ ...prev, cookingGoal: opt.value }))
                }
                className={join(
                  'rounded-xl border p-3 text-left transition-colors',
                  form.cookingGoal === opt.value
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-border hover:bg-muted',
                )}
              >
                <p className='text-foreground text-sm font-medium'>{opt.label}</p>
                <p className='text-muted-foreground mt-0.5 text-xs'>{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          <Label>Household size</Label>
          <SegmentedControl
            options={HOUSEHOLD_SIZE_OPTIONS}
            value={form.householdSize}
            onChange={(v) => setForm((prev) => ({ ...prev, householdSize: v }))}
          />
        </div>

        <div className='space-y-2'>
          <Label>Skill level</Label>
          <SegmentedControl
            options={SKILL_LEVEL_OPTIONS}
            value={form.skillLevel}
            onChange={(v) => setForm((prev) => ({ ...prev, skillLevel: v }))}
          />
        </div>

        <div className='space-y-2'>
          <Label>Cook time preference</Label>
          <SegmentedControl
            options={COOK_TIME_OPTIONS}
            value={form.cookTimePreference}
            onChange={(v) => setForm((prev) => ({ ...prev, cookTimePreference: v }))}
          />
        </div>

        <div className='space-y-2'>
          <Label>Dietary restrictions</Label>
          <div className='flex flex-wrap gap-2'>
            {DIETARY_RESTRICTION_OPTIONS.map((opt) => (
              <ChipToggle
                key={opt.value}
                label={opt.label}
                selected={isDietarySelected(opt.value)}
                onToggle={() => toggleDietary(opt.value)}
              />
            ))}
            <ChipToggle
              label='✏️ Other (specify)'
              selected={showOtherChip}
              onToggle={handleOtherDietaryToggle}
            />
          </div>
          {showOtherChip && (
            <div className='mt-2 space-y-2'>
              <div className='flex flex-wrap gap-1.5'>
                {form.customDietaryRestrictions.map((item) => (
                  <span
                    key={item}
                    className='bg-muted text-foreground flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm'
                  >
                    {item}
                    <button
                      type='button'
                      onClick={() => removeCustomDietary(item)}
                      className='text-muted-foreground hover:text-foreground ml-0.5'
                      aria-label={`Remove ${item}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Input
                ref={otherDietaryRef}
                id='other-dietary-input'
                placeholder='Type a restriction and press Enter'
                value={otherDietaryInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setOtherDietaryInput(e.target.value)
                }
                onKeyDown={handleOtherDietaryKeyDown}
              />
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='avoid-input'>Avoid ingredients</Label>
          <div className='flex flex-wrap gap-1.5'>
            {form.avoidIngredients.map((item) => (
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
          <Input
            ref={avoidInputRef}
            id='avoid-input'
            placeholder='Type an ingredient and press Enter'
            value={avoidInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAvoidInput(e.target.value)
            }
            onKeyDown={handleAvoidKeyDown}
          />
        </div>

        <div className='space-y-2'>
          <Label>Cuisine preferences</Label>
          <div className='flex flex-wrap gap-2'>
            {CUISINE_TYPE_OPTIONS.map((opt) => (
              <ChipToggle
                key={opt.value}
                label={opt.label}
                selected={isCuisineSelected(opt.value)}
                onToggle={() => toggleCuisine(opt.value)}
              />
            ))}
          </div>
        </div>

        <div className='flex items-start gap-3'>
          <Toggle
            id='auto-pantry-toggle'
            checked={form.autoPantryDeduct === true}
            onCheckedChange={(checked) =>
              setForm((prev) => ({ ...prev, autoPantryDeduct: checked }))
            }
            aria-label='Automatically update pantry when I check off shopping list items'
          />
          <Label htmlFor='auto-pantry-toggle'>
            Automatically update pantry when I check off shopping list items
          </Label>
        </div>
      </div>

      <div className='flex gap-3 pt-2'>
        <Button type='submit' variant='primary' disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type='button' variant='secondary' onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
