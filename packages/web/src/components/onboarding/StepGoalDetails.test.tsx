import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepGoalDetails } from './StepGoalDetails';

describe('StepGoalDetails', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepGoalDetails {...baseProps} formData={{ cookingGoal: ['track-macros'] }} />, { wrapper });
    expect(screen.getByText("Let's set your targets")).toBeInTheDocument();
  });

  it('shows macro inputs when track-macros goal is selected', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepGoalDetails {...baseProps} formData={{ cookingGoal: ['track-macros'] }} />, { wrapper });
    expect(screen.getByText('📊 Daily macro targets')).toBeInTheDocument();
    expect(screen.getByLabelText('Protein (g)')).toBeInTheDocument();
    expect(screen.getByLabelText('Carbs (g)')).toBeInTheDocument();
    expect(screen.getByLabelText('Fat (g)')).toBeInTheDocument();
  });

  it('shows budget inputs when save-money goal is selected', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepGoalDetails {...baseProps} formData={{ cookingGoal: ['save-money'] }} />, { wrapper });
    expect(screen.getByText('💸 Weekly grocery budget')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('GBP')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('CAD')).toBeInTheDocument();
  });

  it('shows meal prep days when meal-prep goal is selected', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepGoalDetails {...baseProps} formData={{ cookingGoal: ['meal-prep'] }} />, { wrapper });
    expect(screen.getByText('📦 How many days do you batch cook at once?')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls update with macro targets when protein input changes', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoalDetails {...baseProps} formData={{ cookingGoal: ['track-macros'] }} update={update} />,
      { wrapper },
    );
    fireEvent.change(screen.getByLabelText('Protein (g)'), { target: { value: '150' } });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        cookingGoalDetails: expect.objectContaining({
          'track-macros': expect.objectContaining({ protein: 150 }),
        }),
      }),
    );
  });

  it('calls update with budget details when amount is entered', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoalDetails {...baseProps} formData={{ cookingGoal: ['save-money'] }} update={update} />,
      { wrapper },
    );
    fireEvent.change(screen.getByPlaceholderText('e.g. 100'), { target: { value: '80' } });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        cookingGoalDetails: expect.objectContaining({
          'save-money': expect.objectContaining({ weeklyBudget: 80 }),
        }),
      }),
    );
  });

  it('calls update with currency when currency button clicked', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoalDetails {...baseProps} formData={{ cookingGoal: ['save-money'] }} update={update} />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('GBP'));
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        cookingGoalDetails: expect.objectContaining({
          'save-money': expect.objectContaining({ budgetCurrency: 'GBP' }),
        }),
      }),
    );
  });

  it('calls update with daysAhead when meal prep day clicked', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoalDetails {...baseProps} formData={{ cookingGoal: ['meal-prep'] }} update={update} />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('5'));
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        cookingGoalDetails: expect.objectContaining({
          'meal-prep': { daysAhead: 5 },
        }),
      }),
    );
  });

  it('shows both macro and meal-prep sections when both goals are selected', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <StepGoalDetails
        {...baseProps}
        formData={{ cookingGoal: ['track-macros', 'meal-prep'] }}
      />,
      { wrapper },
    );
    expect(screen.getByText('📊 Daily macro targets')).toBeInTheDocument();
    expect(screen.getByText('📦 How many days do you batch cook at once?')).toBeInTheDocument();
  });
});
