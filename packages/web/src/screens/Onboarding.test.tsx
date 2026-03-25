import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';

vi.mock('@components/onboarding', () => ({
  StepWelcome: () => <div><span>StepWelcome</span></div>,
  StepGoal: () => <div><span>StepGoal</span></div>,
  StepDietary: () => <div><span>StepDietary</span></div>,
  StepCuisines: () => <div><span>StepCuisines</span></div>,
  StepHousehold: () => <div><span>StepHousehold</span></div>,
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
});

