import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';

vi.mock('@components/onboarding', () => ({
  StepWelcome: () => <div><span>StepWelcome</span></div>,
  StepGoal: () => <div><span>StepGoal</span></div>,
  StepDietary: () => <div><span>StepDietary</span></div>,
  StepCuisines: () => <div><span>StepCuisines</span></div>,
  StepHousehold: () => <div><span>StepHousehold</span></div>,
  StepSkill: () => <div><span>StepSkill</span></div>,
  StepCookTime: () => <div><span>StepCookTime</span></div>,
  StepGoalDetails: () => <div><span>StepGoalDetails</span></div>,
  StepStarterIngredients: ({ next, skip }: { next: () => void; skip: () => void }) => (
    <div>
      <span>StepStarterIngredients</span>
      <button onClick={next}>Add to my kitchen</button>
      <button onClick={skip}>Skip for now</button>
    </div>
  ),
  StepLovedMeal: () => <div><span>StepLovedMeal</span></div>,
  StepDislikedMeal: () => <div><span>StepDislikedMeal</span></div>,
  StepAISuggestions: ({ next, skip }: { next: () => void; skip: () => void }) => (
    <div>
      <span>StepAISuggestions</span>
      <button onClick={next}>Save these recipes</button>
      <button onClick={skip}>Skip</button>
    </div>
  ),
  StepComplete: ({ next }: { next: () => void }) => (
    <div>
      <span>StepComplete</span>
      <button onClick={next}>Go to my kitchen →</button>
    </div>
  ),
}));

vi.mock('@hooks/useOnboardingStep', () => ({
  useOnboardingStep: () => ({ visible: true }),
}));

import { Onboarding } from './Onboarding';

describe('Onboarding', () => {
  it('renders StepWelcome on step 0', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    expect(screen.getByText('StepWelcome')).toBeInTheDocument();
  });

  it('shows "Let\'s go" and "Skip setup" on step 0', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    expect(screen.getByText("Let's go")).toBeInTheDocument();
    expect(screen.getByText('Skip setup')).toBeInTheDocument();
  });

  it('advances to StepGoal when "Let\'s go" is clicked', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    expect(screen.getByText('StepGoal')).toBeInTheDocument();
  });

  it('shows progress bar and step count after step 0', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
  });

  it('shows Next, Skip, Previous buttons in footer after step 0', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    expect(screen.getByText('Next →')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.getByText('← Previous')).toBeInTheDocument();
  });

  it('advances through steps with Next →', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    // Skip step 1 (goal required) then advance from step 2 (dietary - always enabled)
    fireEvent.click(screen.getByText('Skip'));
    fireEvent.click(screen.getByText('Next →'));
    expect(screen.getByText('StepCuisines')).toBeInTheDocument();
  });

  it('skips a step with Skip', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    fireEvent.click(screen.getByText('Skip'));
    expect(screen.getByText('StepDietary')).toBeInTheDocument();
  });

  it('goes back with ← Previous', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    fireEvent.click(screen.getByText('Next →'));
    fireEvent.click(screen.getByText('← Previous'));
    expect(screen.getByText('StepGoal')).toBeInTheDocument();
  });

  it('hides standard footer on StepStarterIngredients step', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    // Navigate to StepStarterIngredients (step 8: Welcome, Goal, Dietary, Cuisines, Household, Skill, CookTime, StarterIngredients)
    fireEvent.click(screen.getByText("Let's go")); // step 1
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByText('Skip'));
    }
    expect(screen.getByText('StepStarterIngredients')).toBeInTheDocument();
    expect(screen.queryByText('Next →')).not.toBeInTheDocument();
  });

  it('hides standard footer on StepComplete (last step)', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    // Skip all the way to StepAISuggestions and then save
    fireEvent.click(screen.getByText("Let's go")); // → step 1 (Goal)
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByText('Skip')); // skip Goal through CookTime
    }
    // Now at StepStarterIngredients - click Skip for now
    fireEvent.click(screen.getByText('Skip for now'));
    // LovedMeal
    fireEvent.click(screen.getByText('Skip'));
    // DislikedMeal
    fireEvent.click(screen.getByText('Skip'));
    // AISuggestions - click Skip
    expect(screen.getByText('StepAISuggestions')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Skip'));
    // Now at StepComplete
    expect(screen.getByText('StepComplete')).toBeInTheDocument();
    expect(screen.queryByText('Next →')).not.toBeInTheDocument();
  });
});
