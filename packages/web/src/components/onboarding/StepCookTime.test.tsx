import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepCookTime } from './StepCookTime';

describe('StepCookTime', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepCookTime {...baseProps} />, { wrapper });
    expect(screen.getByText('How much time do you usually have to cook?')).toBeInTheDocument();
  });

  it('renders all cook time options', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepCookTime {...baseProps} />, { wrapper });
    expect(screen.getByText('⚡ Under 20 mins')).toBeInTheDocument();
    expect(screen.getByText('🕐 Around 30 mins')).toBeInTheDocument();
    expect(screen.getByText('⏳ Under an hour')).toBeInTheDocument();
    expect(screen.getByText('🍲 Happy to take my time')).toBeInTheDocument();
  });

  it('calls update with cookTimePreference when option clicked', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepCookTime {...baseProps} update={update} />, { wrapper });
    fireEvent.click(screen.getByText('⚡ Under 20 mins'));
    expect(update).toHaveBeenCalledWith({ cookTimePreference: 'under-20' });
  });

  it('highlights the selected option', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <StepCookTime {...baseProps} formData={{ cookTimePreference: '30-min' }} />,
      { wrapper },
    );
    const btn = screen.getByText('🕐 Around 30 mins').closest('button');
    expect(btn?.className).toContain('border-primary');
  });
});
