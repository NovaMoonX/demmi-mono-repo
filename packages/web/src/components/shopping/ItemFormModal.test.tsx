import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemFormModal, ItemFormModalProps, ItemFormState } from './ItemFormModal';

function defaultForm(overrides: Partial<ItemFormState> = {}): ItemFormState {
  return {
    name: '',
    ingredientId: null,
    productId: null,
    amount: '',
    unit: '',
    category: 'other',
    note: '',
    ...overrides,
  };
}

function defaultProps(overrides: Partial<ItemFormModalProps> = {}): ItemFormModalProps {
  return {
    isOpen: true,
    mode: 'add',
    form: defaultForm(),
    ingredientOptions: [
      { value: 'ing-1', text: 'Chicken' },
      { value: 'ing-2', text: 'Rice' },
    ],
    productOptions: [],
    categoryOptions: [
      { value: 'other', text: 'Other' },
      { value: 'produce', text: 'Produce' },
    ],
    onFormChange: vi.fn(),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

describe('ItemFormModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the modal', () => {
    render(<ItemFormModal {...defaultProps()} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('renders Name input', () => {
    render(<ItemFormModal {...defaultProps()} />);
    expect(screen.getByPlaceholderText('e.g. Dish soap')).toBeInTheDocument();
  });

  it('renders item type toggle buttons', () => {
    render(<ItemFormModal {...defaultProps()} />);
    expect(screen.getByText(/Simple text/)).toBeInTheDocument();
    expect(screen.getByText(/Ingredient/)).toBeInTheDocument();
  });

  it('calls onFormChange when simple text toggle is clicked', () => {
    const onFormChange = vi.fn();
    render(<ItemFormModal {...defaultProps({ onFormChange, form: defaultForm({ ingredientId: 'ing-1' }) })} />);
    fireEvent.click(screen.getByText(/Simple text/));
    expect(onFormChange).toHaveBeenCalledWith({ ingredientId: null, productId: null });
  });

  it('calls onFormChange when ingredient toggle is clicked', () => {
    const onFormChange = vi.fn();
    render(<ItemFormModal {...defaultProps({ onFormChange })} />);
    fireEvent.click(screen.getByText(/Ingredient/));
    expect(onFormChange).toHaveBeenCalledWith({ ingredientId: '' });
  });

  it('renders ingredient selector when ingredient mode is active', () => {
    const form = defaultForm({ ingredientId: '' });
    render(<ItemFormModal {...defaultProps({ form })} />);
    expect(screen.getByText('Chicken')).toBeInTheDocument();
  });

  it('does not render ingredient selector in simple text mode', () => {
    render(<ItemFormModal {...defaultProps()} />);
    expect(screen.queryByText('Chicken')).not.toBeInTheDocument();
  });

  it('renders Cancel and submit buttons', () => {
    render(<ItemFormModal {...defaultProps()} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('renders "Save Changes" in edit mode', () => {
    render(<ItemFormModal {...defaultProps({ mode: 'edit' })} />);
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('disables submit when name is empty', () => {
    render(<ItemFormModal {...defaultProps()} />);
    const submitBtn = screen.getByText('Add Item');
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit when name is provided', () => {
    const form = defaultForm({ name: 'Milk' });
    render(<ItemFormModal {...defaultProps({ form })} />);
    const submitBtn = screen.getByText('Add Item');
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls onSubmit when submit button is clicked', () => {
    const onSubmit = vi.fn();
    const form = defaultForm({ name: 'Milk' });
    render(<ItemFormModal {...defaultProps({ form, onSubmit })} />);
    fireEvent.click(screen.getByText('Add Item'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<ItemFormModal {...defaultProps({ onClose })} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders note textarea', () => {
    render(<ItemFormModal {...defaultProps()} />);
    expect(screen.getByPlaceholderText('Any extra details…')).toBeInTheDocument();
  });

  it('calls onFormChange when name input changes', () => {
    const onFormChange = vi.fn();
    render(<ItemFormModal {...defaultProps({ onFormChange })} />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Dish soap'), { target: { value: 'Soap' } });
    expect(onFormChange).toHaveBeenCalledWith({ name: 'Soap' });
  });

  it('renders product selector when ingredient is linked and products available', () => {
    const form = defaultForm({ ingredientId: 'ing-1' });
    const productOptions = [{ value: 'prod-1', text: 'Organic Chicken' }];
    render(<ItemFormModal {...defaultProps({ form, productOptions })} />);
    expect(screen.getByText('Organic Chicken')).toBeInTheDocument();
  });
});
