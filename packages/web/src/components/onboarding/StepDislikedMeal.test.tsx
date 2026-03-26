import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepDislikedMeal } from './StepDislikedMeal';

describe('StepDislikedMeal', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading and sub-copy', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepDislikedMeal {...baseProps} />, { wrapper });
    expect(screen.getByText("What's a meal you didn't enjoy?")).toBeInTheDocument();
    expect(screen.getByText(/Even if it fits your goals/)).toBeInTheDocument();
  });

  it('renders textarea', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepDislikedMeal {...baseProps} />, { wrapper });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls update with dislikedMealDescription when text entered', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepDislikedMeal {...baseProps} update={update} />, { wrapper });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Mushy vegetables' } });
    expect(update).toHaveBeenCalledWith({ dislikedMealDescription: 'Mushy vegetables' });
  });

  it('calls update with null when text is cleared', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepDislikedMeal
        {...baseProps}
        formData={{ dislikedMealDescription: 'something' }}
        update={update}
      />,
      { wrapper },
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(update).toHaveBeenCalledWith({ dislikedMealDescription: null });
  });
});
