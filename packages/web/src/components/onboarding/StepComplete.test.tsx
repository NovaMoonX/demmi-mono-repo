import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepComplete } from './StepComplete';

describe('StepComplete', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepComplete {...baseProps} />, { wrapper });
    expect(screen.getByText("You're all set! 🎉")).toBeInTheDocument();
  });

  it('renders bullet list items', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepComplete {...baseProps} />, { wrapper });
    expect(screen.getByText('Plan your meals')).toBeInTheDocument();
    expect(screen.getByText('Cook with Demi')).toBeInTheDocument();
    expect(screen.getByText('Keep your pantry stocked')).toBeInTheDocument();
  });

  it('renders "Go to my kitchen" CTA', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepComplete {...baseProps} />, { wrapper });
    expect(screen.getByText('Go to my kitchen →')).toBeInTheDocument();
  });

  it('calls next when "Go to my kitchen" is clicked', () => {
    const next = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepComplete {...baseProps} next={next} />, { wrapper });
    fireEvent.click(screen.getByText('Go to my kitchen →'));
    expect(next).toHaveBeenCalled();
  });
});
