import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepStarterIngredients } from './StepStarterIngredients';

describe('StepStarterIngredients', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading and sub-copy', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepStarterIngredients {...baseProps} />, { wrapper });
    expect(screen.getByText('Add a few ingredients you usually have')).toBeInTheDocument();
    expect(screen.getByText(/This helps Demi suggest recipes/)).toBeInTheDocument();
  });

  it('renders input and Add button', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepStarterIngredients {...baseProps} />, { wrapper });
    expect(screen.getByPlaceholderText('e.g. eggs, olive oil…')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('adds ingredient when Add button clicked', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepStarterIngredients {...baseProps} update={update} />, { wrapper });
    fireEvent.change(screen.getByPlaceholderText('e.g. eggs, olive oil…'), {
      target: { value: 'eggs' },
    });
    fireEvent.click(screen.getByText('Add'));
    expect(update).toHaveBeenCalledWith({ _starterIngredients: ['eggs'] });
  });

  it('adds ingredient when Enter key pressed', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepStarterIngredients {...baseProps} update={update} />, { wrapper });
    const input = screen.getByPlaceholderText('e.g. eggs, olive oil…');
    fireEvent.change(input, { target: { value: 'olive oil' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(update).toHaveBeenCalledWith({ _starterIngredients: ['olive oil'] });
  });

  it('shows chips for added ingredients', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <StepStarterIngredients
        {...baseProps}
        formData={{ _starterIngredients: ['eggs', 'olive oil'] }}
      />,
      { wrapper },
    );
    expect(screen.getByText('eggs')).toBeInTheDocument();
    expect(screen.getByText('olive oil')).toBeInTheDocument();
  });

  it('removes ingredient when × button clicked', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepStarterIngredients
        {...baseProps}
        formData={{ _starterIngredients: ['eggs', 'milk'] }}
        update={update}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByLabelText('Remove eggs'));
    expect(update).toHaveBeenCalledWith({ _starterIngredients: ['milk'] });
  });

  it('calls next when "Add to my kitchen" clicked', () => {
    const next = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepStarterIngredients {...baseProps} next={next} />, { wrapper });
    fireEvent.click(screen.getByText('Add to my kitchen'));
    expect(next).toHaveBeenCalled();
  });

  it('calls skip when "Skip for now" clicked', () => {
    const skip = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepStarterIngredients {...baseProps} skip={skip} />, { wrapper });
    fireEvent.click(screen.getByText('Skip for now'));
    expect(skip).toHaveBeenCalled();
  });

  it('calls back when "← Back" clicked', () => {
    const back = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepStarterIngredients {...baseProps} back={back} />, { wrapper });
    fireEvent.click(screen.getByText('← Back'));
    expect(back).toHaveBeenCalled();
  });
});
