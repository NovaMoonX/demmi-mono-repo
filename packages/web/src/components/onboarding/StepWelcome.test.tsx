import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
