import { useState, useMemo, useEffect } from 'react';
import { Button, Badge, Callout } from '@moondreamsdev/dreamer-ui/components';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import {
  fetchShoppingList,
  createShoppingListItem as createShoppingListItemAsync,
  updateShoppingListItem as updateShoppingListItemAsync,
  deleteShoppingListItem as deleteShoppingListItemAsync,
  clearCheckedShoppingListItems as clearCheckedShoppingListItemsAsync,
} from '@store/actions/shoppingListActions';
import { updateIngredient as updateIngredientAsync } from '@store/actions/ingredientActions';
import { saveUserProfile } from '@store/actions/userProfileActions';
import { INGREDIENT_TYPE_COLORS, INGREDIENT_TYPE_EMOJIS, INGREDIENT_TYPES } from '@lib/ingredients';
import type { Ingredient, IngredientType, MeasurementUnit } from '@lib/ingredients';
import type { ShoppingListItem } from '@lib/shoppingList';
import {
  ItemRow,
  ItemFormModal,
  emptyForm,
  itemToForm,
  type ItemFormState,
} from '@components/shopping';
import { capitalize } from '@utils/capitalize';
import { matchIngredientByName } from '@utils/matchIngredientByName';
import { RECIPE_CATEGORY_OPTIONS } from '@/lib/recipes';

// ─── Main screen ──────────────────────────────────────────────────────────────

export function ShoppingList() {
  const dispatch = useAppDispatch();
  const { confirm } = useActionModal();
  const { addToast } = useToast();
  const items = useAppSelector((state) => state.shoppingList.items);
  const ingredients = useAppSelector((state) => state.ingredients.items);
  const userProfile = useAppSelector((state) => state.userProfile.profile);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyForm());
  const [showChecked, setShowChecked] = useState(true);
  const [pantryPromptItem, setPantryPromptItem] = useState<ShoppingListItem | null>(null);
  const [pantryUpdatedItemId, setPantryUpdatedItemId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchShoppingList());
  }, [dispatch]);

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
      text: `${p.retailer} - ${p.label}`,
    }));
  }, [form.ingredientId, ingredients]);

  const visibleItems = useMemo(
    () => (showChecked ? items : items.filter((i) => !i.checked)),
    [items, showChecked],
  );

  const groupedItems = useMemo(() => {
    const groups = new Map<string, ShoppingListItem[]>();
    for (const cat of INGREDIENT_TYPES) {
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

  const handleSubmit = async () => {
    if (form.name.trim() === '') return;

    const amountParsed = form.amount !== '' ? Number(form.amount) : null;
    const unitParsed = form.unit !== '' ? (form.unit as MeasurementUnit) : null;

    const itemData = {
      name: form.name.trim(),
      ingredientId: form.ingredientId || null,
      productId: form.productId || null,
      amount: amountParsed,
      unit: unitParsed,
      category: form.category,
      note: form.note.trim() || null,
    };

    try {
      if (editingItem) {
        await dispatch(
          updateShoppingListItemAsync({ ...editingItem, ...itemData }),
        ).unwrap();
      } else {
        await dispatch(
          createShoppingListItemAsync({ ...itemData, checked: false }),
        ).unwrap();
      }
      handleClose();
    } catch (err) {
      console.error(editingItem ? 'Failed to update item:' : 'Failed to add item:', err);
      addToast({
        title: editingItem ? 'Failed to update item' : 'Failed to add item',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Remove item',
      message: 'Are you sure you want to remove this item from your shopping list?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!confirmed) return;

    try {
      await dispatch(deleteShoppingListItemAsync(id)).unwrap();
    } catch (err) {
      console.error('Failed to remove item:', err);
      addToast({
        title: 'Failed to remove item',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
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

    if (!confirmed) return;

    try {
      await dispatch(clearCheckedShoppingListItemsAsync()).unwrap();
    } catch (err) {
      console.error('Failed to clear checked items:', err);
      addToast({
        title: 'Failed to clear checked items',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const deductPantry = async (item: ShoppingListItem) => {
    if (item.amount === null || item.unit === null) return;
    const match = matchIngredientByName(item.name, ingredients);
    if (!match) return;
    if (match.unit !== item.unit) return;

    const updatedIngredient: Ingredient = {
      ...match,
      currentAmount: match.currentAmount + item.amount,
    };

    try {
      await dispatch(updateIngredientAsync(updatedIngredient)).unwrap();
      setPantryUpdatedItemId(item.id);
      setTimeout(
        () => setPantryUpdatedItemId((current) => (current === item.id ? null : current)),
        2000,
      );
    } catch (err) {
      console.error('Failed to update pantry:', err);
    }
  };

  const handleToggle = async (item: ShoppingListItem) => {
    const becomingChecked = !item.checked;
    try {
      await dispatch(
        updateShoppingListItemAsync({ ...item, checked: becomingChecked }),
      ).unwrap();

      if (becomingChecked) {
        const autoPantryDeduct = userProfile?.autoPantryDeduct ?? null;
        if (autoPantryDeduct === null) {
          setPantryPromptItem(item);
        } else if (autoPantryDeduct === true) {
          await deductPantry(item);
        }
      }
    } catch (err) {
      console.error('Failed to update item:', err);
      addToast({
        title: 'Failed to update item',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const handlePantryPromptYes = async () => {
    const item = pantryPromptItem;
    setPantryPromptItem(null);
    try {
      await dispatch(saveUserProfile({ autoPantryDeduct: true })).unwrap();
    } catch (err) {
      console.error('Failed to save pantry preference:', err);
    }
    if (item) {
      await deductPantry(item);
    }
  };

  const handlePantryPromptNo = async () => {
    setPantryPromptItem(null);
    try {
      await dispatch(saveUserProfile({ autoPantryDeduct: false })).unwrap();
    } catch (err) {
      console.error('Failed to save pantry preference:', err);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='border-border bg-background/95 sticky top-0 z-10 border-b px-4 pt-10 pb-6 md:py-6 backdrop-blur shrink-0'>
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
      <div className='flex-1 min-h-0 overflow-y-auto px-4 py-4'>
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
            const emoji = INGREDIENT_TYPE_EMOJIS[category];
            const colorClass = INGREDIENT_TYPE_COLORS[category];

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
                      pantryUpdated={pantryUpdatedItemId === item.id}
                      onToggle={() => handleToggle(item)}
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

      {/* Pantry auto-deduct preference prompt */}
      {pantryPromptItem && (
        <div className='border-border bg-background border-t px-4 py-4 shrink-0'>
          <div className='mx-auto max-w-2xl'>
            <Callout
              title='Update your pantry automatically?'
              description={
                <div>
                  <p className='text-muted-foreground mb-3 text-sm'>
                    Would you like to automatically add checked-off quantities to your pantry?
                  </p>
                  <div className='flex gap-2'>
                    <Button size='sm' onClick={handlePantryPromptYes}>
                      Yes, always
                    </Button>
                    <Button variant='secondary' size='sm' onClick={handlePantryPromptNo}>
                      No thanks
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      <ItemFormModal
        isOpen={modalOpen}
        mode={editingItem ? 'edit' : 'add'}
        form={form}
        ingredientOptions={ingredientOptions}
        productOptions={productOptionsForIngredient}
        categoryOptions={RECIPE_CATEGORY_OPTIONS}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
    </div>
  );
}
