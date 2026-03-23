import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { RecipeFromUrl } from './RecipeFromUrl';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecipeFromUrl', () => {
  it('renders the page title', () => {
    const { wrapper } = generateTestWrapper();
    render(<RecipeFromUrl />, { wrapper });
    expect(screen.getByText('Import from URL')).toBeInTheDocument();
  });

  it('renders the description', () => {
    const { wrapper } = generateTestWrapper();
    render(<RecipeFromUrl />, { wrapper });
    expect(
      screen.getByText(
        "Found this recipe online? Drop the link below and we'll get it ready for you.",
      ),
    ).toBeInTheDocument();
  });

  it('renders the back link', () => {
    const { wrapper } = generateTestWrapper();
    render(<RecipeFromUrl />, { wrapper });
    expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
  });

  it('renders the URL input field', () => {
    const { wrapper } = generateTestWrapper();
    render(<RecipeFromUrl />, { wrapper });
    expect(screen.getByLabelText('Recipe URL')).toBeInTheDocument();
  });

  it('disables Continue button when URL is empty', () => {
    const { wrapper } = generateTestWrapper();
    render(<RecipeFromUrl />, { wrapper });
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('enables Continue button when URL is entered', () => {
    const { wrapper } = generateTestWrapper();
    render(<RecipeFromUrl />, { wrapper });
    const input = screen.getByLabelText('Recipe URL');
    fireEvent.change(input, { target: { value: 'https://example.com/recipe' } });
    expect(screen.getByText('Continue')).not.toBeDisabled();
  });

  it('shows URL preview when URL is entered', () => {
    const { wrapper } = generateTestWrapper();
    render(<RecipeFromUrl />, { wrapper });
    const input = screen.getByLabelText('Recipe URL');
    fireEvent.change(input, { target: { value: 'https://example.com/recipe' } });
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/recipe')).toBeInTheDocument();
  });
});
