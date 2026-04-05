import { useMemo, useEffect, useState } from 'react';
import { Button, Checkbox } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import type { ShoppingListItem } from '@lib/shoppingList';
import type { Ingredient } from '@lib/ingredients';

const PANTRY_FADE_START_MS = 1500;
const PANTRY_HIDE_DELAY_MS = 2000;

export interface ItemRowProps {
  item: ShoppingListItem;
  ingredients: Ingredient[];
  pantryUpdated?: boolean;
  onToggle: () => void | Promise<void>;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
}

export function ItemRow({ item, ingredients, pantryUpdated, onToggle, onEdit, onDelete }: ItemRowProps) {
  const unitLabel = item.unit ?? null;
  const [showPantryUpdated, setShowPantryUpdated] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pantryUpdated) {
      setShowPantryUpdated(true);
      setVisible(true);
      const fadeTimer = setTimeout(() => setVisible(false), PANTRY_FADE_START_MS);
      const hideTimer = setTimeout(() => setShowPantryUpdated(false), PANTRY_HIDE_DELAY_MS);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [pantryUpdated]);

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
            🏪 {productInfo.retailer} - {productInfo.label}
          </p>
        )}
        {item.note && (
          <p className='text-muted-foreground mt-0.5 text-xs'>{item.note}</p>
        )}
        {showPantryUpdated && (
          <p
            className={join(
              'mt-0.5 text-xs text-green-600 transition-opacity duration-500',
              visible ? 'opacity-100' : 'opacity-0',
            )}
          >
            ✓ Pantry updated
          </p>
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
