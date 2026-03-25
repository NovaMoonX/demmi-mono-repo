import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepDietary } from './StepDietary';

describe('StepDietary', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepDietary {...baseProps} />, { wrapper });
    expect(screen.getByText('Any dietary preferences?')).toBeInTheDocument();
  });

  it('calls update with restriction when a chip is toggled', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepDietary {...baseProps} update={update} />, { wrapper });
    fireEvent.click(screen.getByText('🌱 Vegan'));
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ dietaryRestrictions: ['vegan'] }),
    );
  });

  it('auto-populates avoidIngredients for nut-free', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepDietary {...baseProps} update={update} />, { wrapper });
    fireEvent.click(screen.getByText('🥜 Nut-Free'));
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ avoidIngredients: expect.arrayContaining(['nuts', 'peanuts']) }),
    );
  });

  it('removes auto-populated avoidIngredients when restriction is deselected', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepDietary
        {...baseProps}
        formData={{
          dietaryRestrictions: ['nut-free'],
          avoidIngredients: ['nuts', 'peanuts', 'tree nuts'],
        }}
        update={update}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('🥜 Nut-Free'));
    const callArg = update.mock.calls[0][0] as { avoidIngredients: string[] };
    expect(callArg.avoidIngredients).toEqual([]);
  });

  it('shows "Have other ingredients you want to avoid?" prompt', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepDietary {...baseProps} />, { wrapper });
    expect(screen.getByText('Have other ingredients you want to avoid?')).toBeInTheDocument();
  });

  it('reveals avoid input when prompt is clicked', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepDietary {...baseProps} />, { wrapper });
    fireEvent.click(screen.getByText('Have other ingredients you want to avoid?'));
    expect(screen.getByPlaceholderText(/shellfish/)).toBeInTheDocument();
  });

  it('adds ingredient to avoidIngredients on Enter', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepDietary {...baseProps} update={update} />, { wrapper });
    fireEvent.click(screen.getByText('Have other ingredients you want to avoid?'));
    const input = screen.getByPlaceholderText(/shellfish/);
    fireEvent.change(input, { target: { value: 'shellfish' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(update).toHaveBeenCalledWith({ avoidIngredients: ['shellfish'] });
  });
});

