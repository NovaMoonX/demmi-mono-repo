import {
  Button,
  Input,
  Textarea,
  Select,
  Modal,
  Label,
} from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import type { MeasurementUnit, IngredientType } from '@lib/ingredients';
import { MEASUREMENT_UNIT_OPTIONS } from '@lib/ingredients';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ItemFormState {
  name: string;
  ingredientId: string | null;
  productId: string | null;
  amount: string;
  unit: MeasurementUnit | '';
  category: IngredientType | 'other';
  note: string;
}

export interface ItemFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  form: ItemFormState;
  ingredientOptions: { value: string; text: string }[];
  productOptions: { value: string; text: string }[];
  categoryOptions: { value: string; text: string }[];
  onFormChange: (updates: Partial<ItemFormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function ItemFormModal({
  isOpen,
  mode,
  form,
  ingredientOptions,
  productOptions,
  categoryOptions,
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
            <Label>
              Ingredient
            </Label>
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
            <Label>
              Product <span className='text-muted-foreground font-normal'>(optional)</span>
            </Label>
            <Select
              options={[{ value: '', text: 'No specific product' }, ...productOptions]}
              value={form.productId ?? ''}
              onChange={(val) => onFormChange({ productId: val || null })}
            />
          </div>
        )}

        {/* Name */}
        <div>
          <Label>
            Name <span className='text-destructive'>*</span>
          </Label>
          <Input
            value={form.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            placeholder={isIngredientLinked ? 'Ingredient name' : 'e.g. Dish soap'}
          />
        </div>

        {/* Amount + Unit */}
        <div className='flex gap-3'>
          <div className='flex-1'>
            <Label>
              Amount <span className='text-muted-foreground font-normal'>(optional)</span>
            </Label>
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
            <Label>
              Unit <span className='text-muted-foreground font-normal'>(optional)</span>
            </Label>
            <Select
              options={[{ value: '', text: 'No unit' }, ...MEASUREMENT_UNIT_OPTIONS]}
              value={form.unit}
              onChange={(val) => onFormChange({ unit: val as MeasurementUnit | '' })}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <Label>
            Category
          </Label>
          <Select
            options={categoryOptions}
            value={form.category}
            onChange={(val) => onFormChange({ category: val as IngredientType | 'other' })}
          />
        </div>

        {/* Note */}
        <div>
          <Label>
            Note <span className='text-muted-foreground font-normal'>(optional)</span>
          </Label>
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
