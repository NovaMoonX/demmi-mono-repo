import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepWelcome } from './StepWelcome';

describe('StepWelcome', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders welcome heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepWelcome {...baseProps} />, { wrapper });
    expect(screen.getByText(/Welcome to Demmi/)).toBeInTheDocument();
  });

  it('renders sub-copy text', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepWelcome {...baseProps} />, { wrapper });
    expect(screen.getByText(/personal cooking space/)).toBeInTheDocument();
  });

  it('calls next when "Let\'s go" is clicked', () => {
    const next = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepWelcome {...baseProps} next={next} />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('renders "Skip setup" button', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepWelcome {...baseProps} />, { wrapper });
    expect(screen.getByText('Skip setup')).toBeInTheDocument();
  });
});
