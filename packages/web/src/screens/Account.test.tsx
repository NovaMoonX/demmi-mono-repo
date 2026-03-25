import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { Account } from './Account';
import type { UserProfile } from '@lib/userProfile';

vi.mock('@components/account', () => ({
  ProfileViewMode: ({ onEdit, onResetOnboarding }: { onEdit: () => void; onResetOnboarding: () => void }) => (
    <div data-testid='profile-view-mode'>
      <button onClick={onEdit}>Edit profile</button>
      <button onClick={onResetOnboarding}>Reset onboarding</button>
    </div>
  ),
  ProfileEditForm: ({ onSave, onCancel }: { onSave: (updates: Partial<UserProfile>) => void; onCancel: () => void }) => (
    <div data-testid='profile-edit-form'>
      <button onClick={() => onSave({})}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

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

describe('Account - loading state', () => {
  it('renders skeleton while loading', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { userProfile: { profile: null, loading: true, error: null } },
    });
    render(<Account />, { wrapper });
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('Account - no profile fallback', () => {
  it('renders callout when profile is null and not loading', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { userProfile: { profile: null, loading: false, error: null } },
    });
    render(<Account />, { wrapper });
    expect(screen.getByTestId('callout')).toBeInTheDocument();
  });
});

describe('Account - view mode', () => {
  it('renders ProfileViewMode when profile is loaded', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { userProfile: { profile: mockProfile, loading: false, error: null } },
    });
    render(<Account />, { wrapper });
    expect(screen.getByTestId('profile-view-mode')).toBeInTheDocument();
  });

  it('switches to edit mode when Edit profile is clicked', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { userProfile: { profile: mockProfile, loading: false, error: null } },
    });
    render(<Account />, { wrapper });
    fireEvent.click(screen.getByText('Edit profile'));
    expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
  });
});

describe('Account - edit mode', () => {
  it('returns to view mode when Cancel is clicked', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { userProfile: { profile: mockProfile, loading: false, error: null } },
    });
    render(<Account />, { wrapper });
    fireEvent.click(screen.getByText('Edit profile'));
    expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByTestId('profile-view-mode')).toBeInTheDocument();
  });
});

