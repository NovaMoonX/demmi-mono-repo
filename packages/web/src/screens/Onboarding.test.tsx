import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';

vi.mock('@components/onboarding', () => ({
  StepWelcome: ({ next }: { next: () => void }) => (
    <div>
      <span>StepWelcome</span>
      <button onClick={next}>Let's go</button>
    </div>
  ),
  StepGoal: ({ next, skip }: { next: () => void; skip: () => void }) => (
    <div>
      <span>StepGoal</span>
      <button onClick={next}>Next</button>
      <button onClick={skip}>Skip</button>
    </div>
  ),
  StepDietary: ({ next, skip }: { next: () => void; skip: () => void }) => (
    <div>
      <span>StepDietary</span>
      <button onClick={next}>Next</button>
      <button onClick={skip}>Skip</button>
    </div>
  ),
  StepCuisines: ({ next, skip }: { next: () => void; skip: () => void }) => (
    <div>
      <span>StepCuisines</span>
      <button onClick={next}>Next</button>
      <button onClick={skip}>Skip</button>
    </div>
  ),
  StepHousehold: ({ next, skip }: { next: () => void; skip: () => void }) => (
    <div>
      <span>StepHousehold</span>
      <button onClick={next}>Next</button>
      <button onClick={skip}>Skip</button>
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

  it('advances to StepGoal when "Let\'s go" is clicked', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    expect(screen.getByText('StepGoal')).toBeInTheDocument();
  });

  it('shows progress bar after step 0', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
  });

  it('shows "Skip setup" button in header after step 0', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    expect(screen.getByText('Skip setup')).toBeInTheDocument();
  });

  it('advances through steps with Next', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('StepDietary')).toBeInTheDocument();
  });

  it('skips a step with Skip', () => {
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    fireEvent.click(screen.getByText('Skip'));
    expect(screen.getByText('StepDietary')).toBeInTheDocument();
  });
});
