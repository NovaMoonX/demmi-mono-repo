import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepProfileSummary } from './StepProfileSummary';

const baseProps = {
  formData: {
    cookingGoal: ['eat-healthier' as const, 'meal-prep' as const],
    dietaryRestrictions: ['vegan' as const],
    cuisinePreferences: ['italian' as const, 'asian' as const],
    skillLevel: 'intermediate' as const,
    cookTimePreference: '30-min' as const,
    householdSize: 2,
  },
  update: vi.fn(),
  next: vi.fn(),
  skip: vi.fn(),
  back: vi.fn(),
  aiLoading: false,
};

describe('StepProfileSummary', () => {
  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepProfileSummary {...baseProps} />, { wrapper });
    expect(screen.getByText("Here's what we know about you")).toBeInTheDocument();
  });

  it('shows goal labels', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepProfileSummary {...baseProps} />, { wrapper });
    expect(screen.getByText(/Eat healthier/)).toBeInTheDocument();
  });

  it('shows loading state when aiLoading is true', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepProfileSummary {...baseProps} aiLoading />, { wrapper });
    expect(
      screen.getByText('Generating your personalized recipes…'),
    ).toBeInTheDocument();
  });

  it('shows ready state when aiLoading is false', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepProfileSummary {...baseProps} aiLoading={false} />, { wrapper });
    expect(
      screen.getByText('Your recipes are ready — tap Next to see them!'),
    ).toBeInTheDocument();
  });

  it('shows skill level', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepProfileSummary {...baseProps} />, { wrapper });
    expect(screen.getByText(/Home cook/)).toBeInTheDocument();
  });

  it('shows dietary restrictions (excluding no-restrictions)', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepProfileSummary {...baseProps} />, { wrapper });
    expect(screen.getByText(/Vegan/)).toBeInTheDocument();
  });

  it('does not show dietary row when only no-restrictions is selected', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <StepProfileSummary
        {...baseProps}
        formData={{ ...baseProps.formData, dietaryRestrictions: ['no-restrictions'] }}
      />,
      { wrapper },
    );
    expect(screen.queryByText('Dietary')).not.toBeInTheDocument();
  });
});
