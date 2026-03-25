import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileEditForm } from './ProfileEditForm';
import type { UserProfile } from '@lib/userProfile';

const mockProfile: UserProfile = {
  userId: 'user-1',
  displayName: 'Test User',
  dietaryRestrictions: [],
  customDietaryRestrictions: [],
  avoidIngredients: [],
  cuisinePreferences: [],
  cookingGoal: 'eat-healthier',
  cookingGoalDetails: null,
  householdSize: 2,
  skillLevel: 'intermediate',
  cookTimePreference: '30-min',
  lovedMealDescription: null,
  dislikedMealDescription: null,
  autoPantryDeduct: null,
  createdAt: 1000000,
  updatedAt: 1000000,
  onboardingCompletedAt: 1000000,
};

describe('ProfileEditForm', () => {
  it('renders the form heading', () => {
    render(
      <ProfileEditForm
        profile={mockProfile}
        saving={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Edit profile')).toBeInTheDocument();
  });

  it('renders Save and Cancel buttons', () => {
    render(
      <ProfileEditForm
        profile={mockProfile}
        saving={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ProfileEditForm
        profile={mockProfile}
        saving={false}
        onSave={vi.fn()}
        onCancel={onCancel}
      />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onSave with form data when submitted', () => {
    const onSave = vi.fn();
    render(
      <ProfileEditForm
        profile={mockProfile}
        saving={false}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledOnce();
    const saved = onSave.mock.calls[0][0] as Partial<UserProfile>;
    expect(saved.cookingGoal).toBe('eat-healthier');
    expect(saved.householdSize).toBe(2);
  });

  it('renders cooking goal options', () => {
    render(
      <ProfileEditForm
        profile={mockProfile}
        saving={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('🥦 Eat healthier')).toBeInTheDocument();
    expect(screen.getByText('💸 Save money')).toBeInTheDocument();
  });

  it('renders dietary restriction options', () => {
    render(
      <ProfileEditForm
        profile={mockProfile}
        saving={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('🥦 Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('🌱 Vegan')).toBeInTheDocument();
  });

  it('renders "Saving…" text when saving is true', () => {
    render(
      <ProfileEditForm
        profile={mockProfile}
        saving={true}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });

  it('shows Other dietary input when Other chip is clicked', () => {
    render(
      <ProfileEditForm
        profile={mockProfile}
        saving={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('✏️ Other (specify)'));
    expect(screen.getByPlaceholderText('Type a restriction and press Enter')).toBeInTheDocument();
  });

  it('adds avoid ingredient on Enter key', () => {
    const onSave = vi.fn();
    render(
      <ProfileEditForm
        profile={mockProfile}
        saving={false}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText('Type an ingredient and press Enter');
    fireEvent.change(input, { target: { value: 'shellfish' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.click(screen.getByText('Save'));
    const saved = onSave.mock.calls[0][0] as Partial<UserProfile>;
    expect(saved.avoidIngredients).toContain('shellfish');
  });
});
