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

  it('calls update with an array when first goal is clicked', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepGoal {...baseProps} update={update} />, { wrapper });
    fireEvent.click(screen.getByText('🥦 Eat healthier'));
    expect(update).toHaveBeenCalledWith({ cookingGoal: ['eat-healthier'] });
  });

  it('adds a second goal up to the max of 2', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoal
        {...baseProps}
        formData={{ cookingGoal: ['eat-healthier'] }}
        update={update}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('💸 Save money'));
    expect(update).toHaveBeenCalledWith({ cookingGoal: ['eat-healthier', 'save-money'] });
  });

  it('deselects a goal when clicked again and returns null when empty', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoal
        {...baseProps}
        formData={{ cookingGoal: ['eat-healthier'] }}
        update={update}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('🥦 Eat healthier'));
    expect(update).toHaveBeenCalledWith({ cookingGoal: null });
  });

  it('disables cards beyond the max of 2 selections', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoal
        {...baseProps}
        formData={{ cookingGoal: ['eat-healthier', 'save-money'] }}
      />,
      { wrapper },
    );
    const saveTimeBtn = screen.getByText('⏱️ Save time').closest('button');
    expect(saveTimeBtn).toBeDisabled();
  });
});

