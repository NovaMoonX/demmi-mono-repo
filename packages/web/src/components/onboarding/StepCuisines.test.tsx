import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepCuisines } from './StepCuisines';

describe('StepCuisines', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepCuisines {...baseProps} />, { wrapper });
    expect(screen.getByText('Favorite cuisines?')).toBeInTheDocument();
  });

  it('calls update when a cuisine is selected', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepCuisines {...baseProps} update={update} />, { wrapper });
    fireEvent.click(screen.getByText(/Italian/i));
    expect(update).toHaveBeenCalledWith({ cuisinePreferences: ['italian'] });
  });

  it('deselects a cuisine when clicked again', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(
      <StepCuisines
        {...baseProps}
        formData={{ cuisinePreferences: ['italian'] }}
        update={update}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText(/Italian/i));
    expect(update).toHaveBeenCalledWith({ cuisinePreferences: [] });
  });

  it('disables additional cuisines when 5 are already selected', () => {
    const { wrapper } = generateTestWrapper();
    render(
      <StepCuisines
        {...baseProps}
        formData={{
          cuisinePreferences: ['italian', 'mexican', 'chinese', 'japanese', 'thai'],
        }}
      />,
      { wrapper },
    );
    const indianBtn = screen.getByText(/Indian/i);
    expect(indianBtn).toBeDisabled();
  });
});
