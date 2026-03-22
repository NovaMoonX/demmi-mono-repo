import { render, screen, fireEvent } from '@testing-library/react';
import { CreateRecipeModal } from './CreateRecipeModal';

describe('CreateRecipeModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSelectManual: jest.fn(),
    onSelectFromText: jest.fn(),
    onSelectFromUrl: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal', () => {
    render(<CreateRecipeModal {...defaultProps} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('renders all three creation options', () => {
    render(<CreateRecipeModal {...defaultProps} />);
    expect(screen.getByText('Manual Entry')).toBeInTheDocument();
    expect(screen.getByText('From Text')).toBeInTheDocument();
    expect(screen.getByText('From URL')).toBeInTheDocument();
  });

  it('renders option icons', () => {
    render(<CreateRecipeModal {...defaultProps} />);
    expect(screen.getByText('✍️')).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
    expect(screen.getByText('🌐')).toBeInTheDocument();
  });

  it('calls onClose and onSelectManual when Manual Entry is clicked', () => {
    render(<CreateRecipeModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Manual Entry'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectManual).toHaveBeenCalledTimes(1);
  });

  it('calls onClose and onSelectFromText when From Text is clicked', () => {
    render(<CreateRecipeModal {...defaultProps} />);
    fireEvent.click(screen.getByText('From Text'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectFromText).toHaveBeenCalledTimes(1);
  });

  it('calls onClose and onSelectFromUrl when From URL is clicked', () => {
    render(<CreateRecipeModal {...defaultProps} />);
    fireEvent.click(screen.getByText('From URL'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectFromUrl).toHaveBeenCalledTimes(1);
  });

  it('renders descriptions for each option', () => {
    render(<CreateRecipeModal {...defaultProps} />);
    expect(screen.getByText(/Fill in every detail yourself/)).toBeInTheDocument();
    expect(screen.getByText(/Paste it once/)).toBeInTheDocument();
    expect(screen.getByText(/Just drop the link/)).toBeInTheDocument();
  });
});
