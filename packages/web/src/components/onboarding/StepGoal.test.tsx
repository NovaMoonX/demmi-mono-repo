import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepGoal } from './StepGoal';

describe('StepGoal', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepGoal {...baseProps} />, { wrapper });
    expect(screen.getByText('What brings you here?')).toBeInTheDocument();
  });

  it('calls update with selected goal when a card is clicked', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepGoal {...baseProps} update={update} />, { wrapper });
    fireEvent.click(screen.getByText('🥦 Eat healthier'));
    expect(update).toHaveBeenCalledWith({ cookingGoal: 'eat-healthier' });
  });

  it('deselects a goal when clicked again', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoal {...baseProps} formData={{ cookingGoal: 'eat-healthier' }} update={update} />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('🥦 Eat healthier'));
    expect(update).toHaveBeenCalledWith({ cookingGoal: null });
  });

  it('calls skip when Skip is clicked', () => {
    const skip = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepGoal {...baseProps} skip={skip} />, { wrapper });
    fireEvent.click(screen.getByText('Skip'));
    expect(skip).toHaveBeenCalledTimes(1);
  });

  it('Next button is disabled when no goal is selected', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepGoal {...baseProps} formData={{}} />, { wrapper });
    const nextBtn = screen.getByText('Next');
    expect(nextBtn).toBeDisabled();
  });

  it('Next button is enabled when a goal is selected', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoal {...baseProps} formData={{ cookingGoal: 'meal-prep' }} />,
      { wrapper },
    );
    const nextBtn = screen.getByText('Next');
    expect(nextBtn).not.toBeDisabled();
  });
});
