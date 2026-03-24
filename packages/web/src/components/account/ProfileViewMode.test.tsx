import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileViewMode } from './ProfileViewMode';
import type { UserProfile } from '@lib/userProfile';

const mockProfile: UserProfile = {
  userId: 'user-1',
  displayName: 'Test User',
  dietaryRestrictions: ['vegetarian'],
  customDietaryRestrictions: ['nightshades'],
  avoidIngredients: ['peanuts'],
  cuisinePreferences: ['italian'],
  cookingGoal: 'eat-healthier',
  cookingGoalDetails: null,
  householdSize: 2,
  skillLevel: 'intermediate',
  cookTimePreference: '30-min',
  lovedMealDescription: null,
  dislikedMealDescription: null,
  autoPantryDeduct: true,
  createdAt: 1000000,
  updatedAt: 1000000,
  onboardingCompletedAt: 1000000,
};

describe('ProfileViewMode', () => {
  it('renders the display name', () => {
    render(
      <ProfileViewMode
        profile={mockProfile}
        onEdit={vi.fn()}
        onResetOnboarding={vi.fn()}
      />,
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders the cooking goal badge', () => {
    render(
      <ProfileViewMode
        profile={mockProfile}
        onEdit={vi.fn()}
        onResetOnboarding={vi.fn()}
      />,
    );
    expect(screen.getByText('🥦 Eat healthier')).toBeInTheDocument();
  });

  it('renders dietary restriction badges', () => {
    render(
      <ProfileViewMode
        profile={mockProfile}
        onEdit={vi.fn()}
        onResetOnboarding={vi.fn()}
      />,
    );
    expect(screen.getByText('🥦 Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('nightshades')).toBeInTheDocument();
  });

  it('renders avoid ingredient badge', () => {
    render(
      <ProfileViewMode
        profile={mockProfile}
        onEdit={vi.fn()}
        onResetOnboarding={vi.fn()}
      />,
    );
    expect(screen.getByText('peanuts')).toBeInTheDocument();
  });

  it('renders "Edit profile" button and calls onEdit when clicked', () => {
    const onEdit = vi.fn();
    render(
      <ProfileViewMode
        profile={mockProfile}
        onEdit={onEdit}
        onResetOnboarding={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Edit profile'));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('calls onResetOnboarding when Reset onboarding is clicked', () => {
    const onReset = vi.fn();
    render(
      <ProfileViewMode
        profile={mockProfile}
        onEdit={vi.fn()}
        onResetOnboarding={onReset}
      />,
    );
    fireEvent.click(screen.getByText('Reset onboarding'));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('renders "Not set" for empty fields', () => {
    const emptyProfile: UserProfile = {
      ...mockProfile,
      dietaryRestrictions: [],
      customDietaryRestrictions: [],
      avoidIngredients: [],
      cuisinePreferences: [],
      cookingGoal: null,
      skillLevel: null,
      cookTimePreference: null,
    };
    render(
      <ProfileViewMode
        profile={emptyProfile}
        onEdit={vi.fn()}
        onResetOnboarding={vi.fn()}
      />,
    );
    const notSetElements = screen.getAllByText('Not set');
    expect(notSetElements.length).toBeGreaterThan(0);
  });

  it('renders auto-deduct enabled text', () => {
    render(
      <ProfileViewMode
        profile={mockProfile}
        onEdit={vi.fn()}
        onResetOnboarding={vi.fn()}
      />,
    );
    expect(screen.getByText('Auto-deduct enabled')).toBeInTheDocument();
  });
});
