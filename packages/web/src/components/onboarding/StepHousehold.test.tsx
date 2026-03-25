import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepHousehold } from './StepHousehold';

describe('StepHousehold', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepHousehold {...baseProps} />, { wrapper });
    expect(screen.getByText('How many people are you cooking for?')).toBeInTheDocument();
  });

  it('calls update with household size when an option is selected', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepHousehold {...baseProps} update={update} />, { wrapper });
    fireEvent.click(screen.getByText('Just me'));
    expect(update).toHaveBeenCalledWith({ householdSize: 1 });
  });

  it('Next button is disabled when no household size is selected', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepHousehold {...baseProps} formData={{}} />, { wrapper });
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('Next button is enabled when a household size is selected', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepHousehold {...baseProps} formData={{ householdSize: 2 }} />, { wrapper });
    expect(screen.getByText('Next')).not.toBeDisabled();
  });

  it('calls skip when Skip is clicked', () => {
    const skip = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepHousehold {...baseProps} skip={skip} />, { wrapper });
    fireEvent.click(screen.getByText('Skip'));
    expect(skip).toHaveBeenCalledTimes(1);
  });
});
