import { useState, useMemo } from 'react';
import {
  Button,
  Badge,
  Input,
  Textarea,
  Select,
  Modal,
  Checkbox,
} from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import {
  addShoppingListItem,
  updateShoppingListItem,
  toggleShoppingListItem,
  deleteShoppingListItem,
  clearCheckedItems,
} from '@store/slices/shoppingListSlice';
import {
  INGREDIENT_TYPE_COLORS,
  INGREDIENT_TYPE_EMOJIS,
  MEASUREMENT_UNIT_LABELS,
} from '@lib/ingredients';
import type { ShoppingListItem } from '@lib/shoppingList';
import type { IngredientType, MeasurementUnit, Ingredient } from '@lib/ingredients';
import { capitalize } from '@/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_ORDER: Array<IngredientType | 'other'> = [
  'meat',
  'seafood',
  'produce',
  'dairy',
  'grains',
  'legumes',
  'nuts',
  'oils',
  'spices',
  'other',
];

const CATEGORY_COLOR_MAP: Record<IngredientType | 'other', string> = {
  ...INGREDIENT_TYPE_COLORS,
  other: 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
};

const CATEGORY_EMOJI_MAP: Record<IngredientType | 'other', string> = {
  ...INGREDIENT_TYPE_EMOJIS,
  other: '📦',
};

const CATEGORY_OPTIONS: { value: string; text: string }[] = [
  ...CATEGORY_ORDER.map((cat) => ({
    value: cat,
    text: `${CATEGORY_EMOJI_MAP[cat]} ${capitalize(cat)}`,
  })),
];

const UNIT_OPTIONS: { value: string; text: string }[] = Object.entries(
  MEASUREMENT_UNIT_LABELS
).map(([value, text]) => ({ value, text }));

// ─── Empty form state ─────────────────────────────────────────────────────────

interface ItemFormState {
  name: string;
  ingredientId: string | null;
  productId: string | null;
  amount: string;
  unit: MeasurementUnit | '';
  category: IngredientType | 'other';
  note: string;
}

function emptyForm(): ItemFormState {
  return {
    name: '',
    ingredientId: null,
    productId: null,
    amount: '',
    unit: '',
    category: 'other',
    note: '',
  };
}

function itemToForm(item: ShoppingListItem): ItemFormState {
  return {
    name: item.name,
    ingredientId: item.ingredientId,
    productId: item.productId,
    amount: item.amount !== null ? String(item.amount) : '',
    unit: item.unit ?? '',
    category: item.category,
    note: item.note ?? '',
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ShoppingListItem;
  ingredients: Ingredient[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ItemRow({ item, ingredients, onToggle, onEdit, onDelete }: ItemRowProps) {
  const unitLabel = item.unit ?? null;
  
  // Look up product info if available
  const productInfo = useMemo(() => {
    if (!item.ingredientId || !item.productId) return null;
    const ingredient = ingredients.find((ing) => ing.id === item.ingredientId);
    if (!ingredient) return null;
    const product = ingredient.products.find((p) => p.id === item.productId);
    const result = product ?? null;
    return result;
  }, [item.ingredientId, item.productId, ingredients]);

  return (
    <div
      className={join(
        'border-border flex items-start gap-3 rounded-lg border p-3 transition-colors',
        item.checked ? 'bg-muted/40 opacity-60' : 'bg-card',
      )}
    >
      <Checkbox size={18} checked={item.checked} onCheckedChange={onToggle} className='mt-0.5' />

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <span
            className={join(
              'text-foreground text-sm font-medium',
              item.checked && 'line-through',
            )}
          >
            {item.name}
          </span>
          {(item.amount !== null) && (
            <span className='text-muted-foreground text-xs'>
              {item.amount}{unitLabel ? ` ${unitLabel}` : ''}
            </span>
          )}
        </div>
        {productInfo && (
          <p className='text-muted-foreground mt-0.5 text-xs'>
            🏪 {productInfo.retailer} – {productInfo.label}
          </p>
        )}
        {item.note && (
          <p className='text-muted-foreground mt-0.5 text-xs'>{item.note}</p>
        )}
      </div>

      {/* Actions */}
      <div className='flex shrink-0 items-center gap-1'>
        <Button variant='tertiary' size='sm' onClick={onEdit} className='h-7 px-2 text-xs'>
          Edit
        </Button>
        <Button
          variant='tertiary'
          size='sm'
          onClick={onDelete}
          className='text-destructive hover:text-destructive h-7 px-2 text-xs'
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

// ─── Item form modal ──────────────────────────────────────────────────────────

interface ItemFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  form: ItemFormState;
  ingredientOptions: { value: string; text: string }[];
  productOptions: { value: string; text: string }[];
  onFormChange: (updates: Partial<ItemFormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

function ItemFormModal({
  isOpen,
  mode,
  form,
  ingredientOptions,
  productOptions,
  onFormChange,
  onSubmit,
  onClose,
}: ItemFormModalProps) {
  const isIngredientLinked = form.ingredientId !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? '➕ Add Item' : '✏️ Edit Item'}
    >
      <div className='flex flex-col gap-4 pt-2'>
        {/* Item type toggle */}
        <div className='flex gap-2'>
          <button
            onClick={() => onFormChange({ ingredientId: null, productId: null })}
            className={join(
              'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors',
              !isIngredientLinked
                ? 'border-accent bg-accent/10 text-accent font-medium'
                : 'border-border text-foreground/70 hover:bg-muted',
            )}
          >
            📝 Simple text
          </button>
          <button
            onClick={() => onFormChange({ ingredientId: '' })}
            className={join(
              'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors',
              isIngredientLinked
                ? 'border-accent bg-accent/10 text-accent font-medium'
                : 'border-border text-foreground/70 hover:bg-muted',
            )}
          >
            🍎 Ingredient
          </button>
        </div>

        {/* Ingredient selector */}
        {isIngredientLinked && ingredientOptions.length > 0 && (
          <div>
            <label className='text-foreground mb-1 block text-sm font-medium'>
              Ingredient
            </label>
            <Select
              options={[{ value: '', text: 'Select ingredient…' }, ...ingredientOptions]}
              value={form.ingredientId ?? ''}
              onChange={(val) =>
                onFormChange({ ingredientId: val || null, productId: null })
              }
            />
          </div>
        )}

        {/* Product selector */}
        {isIngredientLinked && productOptions.length > 0 && (
          <div>
            <label className='text-foreground mb-1 block text-sm font-medium'>
              Product <span className='text-muted-foreground font-normal'>(optional)</span>
            </label>
            <Select
              options={[{ value: '', text: 'No specific product' }, ...productOptions]}
              value={form.productId ?? ''}
              onChange={(val) => onFormChange({ productId: val || null })}
            />
          </div>
        )}

        {/* Name */}
        <div>
          <label className='text-foreground mb-1 block text-sm font-medium'>
            Name <span className='text-destructive'>*</span>
          </label>
          <Input
            value={form.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            placeholder={isIngredientLinked ? 'Ingredient name' : 'e.g. Dish soap'}
          />
        </div>

        {/* Amount + Unit */}
        <div className='flex gap-3'>
          <div className='flex-1'>
            <label className='text-foreground mb-1 block text-sm font-medium'>
              Amount <span className='text-muted-foreground font-normal'>(optional)</span>
            </label>
            <Input
              type='number'
              min='0'
              step='any'
              value={form.amount}
              onChange={(e) => onFormChange({ amount: e.target.value })}
              placeholder='e.g. 2'
            />
          </div>
          <div className='flex-1'>
            <label className='text-foreground mb-1 block text-sm font-medium'>
              Unit <span className='text-muted-foreground font-normal'>(optional)</span>
            </label>
            <Select
              options={[{ value: '', text: 'No unit' }, ...UNIT_OPTIONS]}
              value={form.unit}
              onChange={(val) => onFormChange({ unit: val as MeasurementUnit | '' })}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className='text-foreground mb-1 block text-sm font-medium'>
            Category
          </label>
          <Select
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={(val) => onFormChange({ category: val as IngredientType | 'other' })}
          />
        </div>

        {/* Note */}
        <div>
          <label className='text-foreground mb-1 block text-sm font-medium'>
            Note <span className='text-muted-foreground font-normal'>(optional)</span>
          </label>
          <Textarea
            value={form.note}
            onChange={(e) => onFormChange({ note: e.target.value })}
            placeholder='Any extra details…'
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-2 pt-1'>
          <Button variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={form.name.trim() === ''}>
            {mode === 'add' ? 'Add Item' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function ShoppingList() {
  const dispatch = useAppDispatch();
  const { confirm } = useActionModal();
  const items = useAppSelector((state) => state.shoppingList.items);
  const ingredients = useAppSelector((state) => state.ingredients.items);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyForm());
  const [showChecked, setShowChecked] = useState(true);

  // ── Derived data ─────────────────────────────────────────────────────────

  const ingredientOptions = useMemo(
    () =>
      ingredients.map((ing) => ({
        value: ing.id,
        text: `${INGREDIENT_TYPE_EMOJIS[ing.type]} ${ing.name}`,
      })),
    [ingredients],
  );

  const productOptionsForIngredient = useMemo(() => {
    if (!form.ingredientId) return [];
    const ing = ingredients.find((i) => i.id === form.ingredientId);
    if (!ing) return [];
    return ing.products.map((p) => ({
      value: p.id,
      text: `${p.retailer} – ${p.label}`,
    }));
  }, [form.ingredientId, ingredients]);

  const visibleItems = useMemo(
    () => (showChecked ? items : items.filter((i) => !i.checked)),
    [items, showChecked],
  );

  const groupedItems = useMemo(() => {
    const groups = new Map<string, ShoppingListItem[]>();
    for (const cat of CATEGORY_ORDER) {
      const inCat = visibleItems.filter((i) => i.category === cat);
      if (inCat.length > 0) {
        groups.set(cat, inCat);
      }
    }
    const result = groups;
    return result;
  }, [visibleItems]);

  const checkedCount = useMemo(
    () => items.filter((i) => i.checked).length,
    [items],
  );

  const totalCount = items.length;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFormChange = (updates: Partial<ItemFormState>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };

      // When an ingredient is selected auto-fill name and category
      if ('ingredientId' in updates && updates.ingredientId) {
        const ing = ingredients.find((i) => i.id === updates.ingredientId);
        if (ing) {
          next.name = ing.name;
          next.category = ing.type;
          next.unit = ing.unit;
        }
      }

      const result = next;
      return result;
    });
  };

  const openAddModal = () => {
    setEditingItem(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEditModal = (item: ShoppingListItem) => {
    setEditingItem(item);
    setForm(itemToForm(item));
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (form.name.trim() === '') return;

    const amountParsed = form.amount !== '' ? parseFloat(form.amount) : null;
    const unitParsed = form.unit !== '' ? (form.unit as MeasurementUnit) : null;

    if (editingItem) {
      dispatch(
        updateShoppingListItem({
          id: editingItem.id,
          updates: {
            name: form.name.trim(),
            ingredientId: form.ingredientId || null,
            productId: form.productId || null,
            amount: amountParsed,
            unit: unitParsed,
            category: form.category,
            note: form.note.trim() || null,
          },
        }),
      );
    } else {
      dispatch(
        addShoppingListItem({
          name: form.name.trim(),
          ingredientId: form.ingredientId || null,
          productId: form.productId || null,
          amount: amountParsed,
          unit: unitParsed,
          category: form.category,
          note: form.note.trim() || null,
          checked: false,
        }),
      );
    }

    handleClose();
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove item',
      message: 'Are you sure you want to remove this item from your shopping list?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (confirmed) {
      dispatch(deleteShoppingListItem(id));
    }
  };

  const handleClearChecked = async () => {
    const confirmed = await confirm({
      title: 'Clear checked items',
      message: `Remove all ${checkedCount} checked item${checkedCount !== 1 ? 's' : ''} from the list?`,
      confirmText: 'Clear',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (confirmed) {
      dispatch(clearCheckedItems());
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className='flex h-full flex-col mt-10 md:mt-0'>
      {/* Header */}
      <div className='border-border bg-background/95 sticky top-0 z-10 border-b px-4 py-6 backdrop-blur'>
        <div className='mx-auto max-w-2xl'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h1 className='text-foreground text-xl font-bold'>🛒 Shopping List</h1>
              {totalCount > 0 && (
                <p className='text-muted-foreground mt-0.5 text-sm'>
                  {checkedCount}/{totalCount} items checked
                </p>
              )}
            </div>
            <div className='flex items-center gap-2'>
              {checkedCount > 0 && (
                <Button variant='secondary' size='sm' onClick={handleClearChecked}>
                  Clear checked
                </Button>
              )}
              <Button size='sm' onClick={openAddModal}>
                + Add item
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className='bg-muted mt-3 h-1.5 w-full overflow-hidden rounded-full'>
              <div
                className='bg-accent h-full rounded-full transition-all duration-300'
                style={{ width: `${(checkedCount / totalCount) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className='flex-1 overflow-y-auto px-4 py-4'>
        <div className='mx-auto max-w-2xl space-y-6'>
          {/* Empty state */}
          {items.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <span className='mb-3 text-5xl'>🛒</span>
              <p className='text-foreground text-lg font-semibold'>Your list is empty</p>
              <p className='text-muted-foreground mt-1 text-sm'>
                Add ingredients or other items to get started.
              </p>
              <Button className='mt-4' onClick={openAddModal}>
                + Add first item
              </Button>
            </div>
          )}

          {/* Show/hide checked toggle */}
          {checkedCount > 0 && totalCount > 0 && (
            <button
              onClick={() => setShowChecked((v) => !v)}
              className='text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors'
            >
              <span>{showChecked ? '👁️' : '🙈'}</span>
              <span>{showChecked ? `Hide ${checkedCount} checked` : `Show ${checkedCount} checked`}</span>
            </button>
          )}

          {/* Groups */}
          {Array.from(groupedItems.entries()).map(([cat, groupItems]) => {
            const category = cat as IngredientType | 'other';
            const emoji = CATEGORY_EMOJI_MAP[category];
            const colorClass = CATEGORY_COLOR_MAP[category];

            return (
              <div key={cat} className='space-y-2'>
                {/* Category header */}
                <div className='flex items-center gap-2'>
                  <Badge className={colorClass}>
                    {emoji} {capitalize(cat)}
                  </Badge>
                  <span className='text-muted-foreground text-xs'>
                    {groupItems.filter((i) => i.checked).length}/{groupItems.length}
                  </span>
                </div>

                {/* Items */}
                <div className='space-y-2'>
                  {groupItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      ingredients={ingredients}
                      onToggle={() => dispatch(toggleShoppingListItem(item.id))}
                      onEdit={() => openEditModal(item)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit modal */}
      <ItemFormModal
        isOpen={modalOpen}
        mode={editingItem ? 'edit' : 'add'}
        form={form}
        ingredientOptions={ingredientOptions}
        productOptions={productOptionsForIngredient}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
    </div>
  );
}
