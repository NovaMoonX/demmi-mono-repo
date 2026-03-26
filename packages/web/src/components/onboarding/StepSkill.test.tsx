import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { StepSkill } from './StepSkill';

describe('StepSkill', () => {
  const baseProps = {
    formData: {},
    update: vi.fn(),
    next: vi.fn(),
    skip: vi.fn(),
    back: vi.fn(),
  };

  it('renders heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepSkill {...baseProps} />, { wrapper });
    expect(screen.getByText('How confident are you in the kitchen?')).toBeInTheDocument();
  });

  it('renders all skill level options', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepSkill {...baseProps} />, { wrapper });
    expect(screen.getByText('🔰 Still learning')).toBeInTheDocument();
    expect(screen.getByText('👨‍🍳 Home cook')).toBeInTheDocument();
    expect(screen.getByText('🍴 Pretty experienced')).toBeInTheDocument();
  });

  it('calls update with skillLevel when option clicked', () => {
    const update = vi.fn();
    const { wrapper } = generateTestWrapper();
    render(<StepSkill {...baseProps} update={update} />, { wrapper });
    fireEvent.click(screen.getByText('🔰 Still learning'));
    expect(update).toHaveBeenCalledWith({ skillLevel: 'beginner' });
  });

  it('highlights the selected option', () => {
    const { wrapper } = generateTestWrapper();
    render(<StepSkill {...baseProps} formData={{ skillLevel: 'intermediate' }} />, { wrapper });
    const btn = screen.getByText('👨‍🍳 Home cook').closest('button');
    expect(btn?.className).toContain('border-primary');
  });
});
