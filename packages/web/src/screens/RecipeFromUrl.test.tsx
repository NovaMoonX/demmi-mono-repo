import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { RecipeFromUrl } from './RecipeFromUrl';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecipeFromUrl', () => {
  it('renders the page title', () => {
    renderWithProviders(<RecipeFromUrl />);
    expect(screen.getByText('Import from URL')).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderWithProviders(<RecipeFromUrl />);
    expect(
      screen.getByText(
        "Found this recipe online? Drop the link below and we'll get it ready for you.",
      ),
    ).toBeInTheDocument();
  });

  it('renders the back link', () => {
    renderWithProviders(<RecipeFromUrl />);
    expect(screen.getByText('← Back to Recipes')).toBeInTheDocument();
  });

  it('renders the URL input field', () => {
    renderWithProviders(<RecipeFromUrl />);
    expect(screen.getByLabelText('Recipe URL')).toBeInTheDocument();
  });

  it('disables Continue button when URL is empty', () => {
    renderWithProviders(<RecipeFromUrl />);
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('enables Continue button when URL is entered', () => {
    renderWithProviders(<RecipeFromUrl />);
    const input = screen.getByLabelText('Recipe URL');
    fireEvent.change(input, { target: { value: 'https://example.com/recipe' } });
    expect(screen.getByText('Continue')).not.toBeDisabled();
  });

  it('shows URL preview when URL is entered', () => {
    renderWithProviders(<RecipeFromUrl />);
    const input = screen.getByLabelText('Recipe URL');
    fireEvent.change(input, { target: { value: 'https://example.com/recipe' } });
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/recipe')).toBeInTheDocument();
  });

  it('navigates to /recipes/new with state when Continue is clicked', () => {
    renderWithProviders(<RecipeFromUrl />);
    const input = screen.getByLabelText('Recipe URL');
    fireEvent.change(input, { target: { value: 'https://example.com/recipe' } });
    fireEvent.click(screen.getByText('Continue'));
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/new', {
      state: { sourceUrl: 'https://example.com/recipe' },
    });
  });

  it('navigates to /recipes when Cancel is clicked', () => {
    renderWithProviders(<RecipeFromUrl />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/recipes');
  });
});
