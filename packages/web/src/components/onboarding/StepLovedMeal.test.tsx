import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepLovedMeal } from './StepLovedMeal';

describe('StepLovedMeal', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading and sub-copy', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepLovedMeal {...baseProps} />, { wrapper });
    expect(screen.getByText('Tell us about a meal you loved')).toBeInTheDocument();
    expect(screen.getByText(/Describe a meal you enjoyed/)).toBeInTheDocument();
  });

  it('renders textarea', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepLovedMeal {...baseProps} />, { wrapper });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls update with lovedMealDescription when text entered', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepLovedMeal {...baseProps} update={update} />, { wrapper });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Pasta bolognese' } });
    expect(update).toHaveBeenCalledWith({ lovedMealDescription: 'Pasta bolognese' });
  });

  it('calls update with null when text is cleared', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepLovedMeal
        {...baseProps}
        formData={{ lovedMealDescription: 'something' }}
        update={update}
      />,
      { wrapper },
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(update).toHaveBeenCalledWith({ lovedMealDescription: null });
  });
});
