import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Badge, Select, Modal } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import {
  Ingredient,
  INGREDIENT_TYPE_EMOJIS,
  INGREDIENT_TYPE_COLORS,
} from '@lib/ingredients';
import { MealIngredient } from '@lib/meals';
import { capitalize } from '@utils/capitalize';
import { CreateIngredientModal } from '@components/ingredients';

const MIN_SERVINGS = 0.1;

interface MealIngredientSelectorProps {
  ingredients: Ingredient[];
  selectedIngredients: MealIngredient[];
  onChange: (ingredients: MealIngredient[]) => void;
  fromMealPath: string;
}

export function MealIngredientSelector({
  ingredients,
  selectedIngredients,
  onChange,
  fromMealPath,
}: MealIngredientSelectorProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateIngredientModalOpen, setIsCreateIngredientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const typeOptions = useMemo(() => {
    const options = Object.entries(INGREDIENT_TYPE_EMOJIS).map(([type, emoji]) => ({
      value: type,
      text: `${emoji} ${capitalize(type)}`,
    }));
    return [{ value: 'all', text: 'All Types' }, ...options];
  }, []);

  const filteredIngredients = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const result = ingredients.filter((ingredient) => {
      const matchesSearch = ingredient.name.toLowerCase().includes(query);
      const matchesType = typeFilter === 'all' || ingredient.type === typeFilter;
      return matchesSearch && matchesType;
    });
    return result;
  }, [ingredients, searchQuery, typeFilter]);

  const selectedSet = useMemo(
    () => new Set(selectedIngredients.map((si) => si.ingredientId)),
    [selectedIngredients],
  );

  const handleAdd = (ingredient: Ingredient) => {
    if (selectedSet.has(ingredient.id)) return;
    const updated = [
      ...selectedIngredients,
      { ingredientId: ingredient.id, servings: 1 },
    ];
    onChange(updated);
  };

  const handleRemove = (ingredientId: string) => {
    const updated = selectedIngredients.filter(
      (si) => si.ingredientId !== ingredientId,
    );
    onChange(updated);
  };

  const handleServingsChange = (ingredientId: string, value: string) => {
    const parsed = Number(value);
    const servings = Number.isNaN(parsed) || parsed < MIN_SERVINGS ? MIN_SERVINGS : parsed;
    const updated = selectedIngredients.map((si) =>
      si.ingredientId === ingredientId ? { ...si, servings } : si,
    );
    onChange(updated);
  };

  const openModal = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getIngredientById = (id: string) =>
    ingredients.find((ing) => ing.id === id);

  const getUnitLabel = (ingredient: Ingredient): string => {
    if (ingredient.unit === 'other' && ingredient.otherUnit) {
      return ingredient.otherUnit;
    }
    return ingredient.unit;
  };

  return (
    <div className="space-y-3">
      {/* Selected Ingredients List */}
      {selectedIngredients.length > 0 ? (
        <div className="space-y-2">
          {selectedIngredients.map((si) => {
            const ingredient = getIngredientById(si.ingredientId);
            if (!ingredient) return null;

            const emoji = INGREDIENT_TYPE_EMOJIS[ingredient.type];
            const colorClass = INGREDIENT_TYPE_COLORS[ingredient.type];
            const unitLabel = getUnitLabel(ingredient);

            return (
              <div
                key={si.ingredientId}
                className="flex gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {ingredient.name}
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(si.ingredientId)}
                      aria-label={`Remove ${ingredient.name}`}
                      className="shrink-0"
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge
                      variant="base"
                      className={join('capitalize text-xs', colorClass)}
                    >
                      {ingredient.type}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={MIN_SERVINGS}
                        step="0.1"
                        value={si.servings.toString()}
                        onChange={(e) =>
                          handleServingsChange(si.ingredientId, e.target.value)
                        }
                        className="w-16 text-center text-xs h-7 px-1"
                        aria-label={`Servings for ${ingredient.name}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {unitLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No ingredients added yet.</p>
      )}

      {/* Add Ingredient Button */}
      <Button type="button" variant="secondary" onClick={openModal}>
        + Add Ingredient
      </Button>

      {/* Ingredient Picker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add Ingredients"
        actions={[{ label: 'Done', variant: 'primary', onClick: closeModal }]}
      >
        <div className="space-y-3 w-full sm:min-w-96">
          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-36 shrink-0">
              <Select
                options={typeOptions}
                value={typeFilter}
                onChange={(value) => setTypeFilter(value)}
                placeholder="All Types"
              />
            </div>
          </div>

          {/* Ingredient List */}
          {ingredients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No ingredients in your inventory yet.
            </p>
          ) : filteredIngredients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No ingredients match your search.
            </p>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {filteredIngredients.map((ingredient) => {
                const isSelected = selectedSet.has(ingredient.id);
                const emoji = INGREDIENT_TYPE_EMOJIS[ingredient.type];
                const colorClass = INGREDIENT_TYPE_COLORS[ingredient.type];
                const unitLabel = getUnitLabel(ingredient);

                return (
                  <div
                    key={ingredient.id}
                    className={join(
                      'flex items-center gap-3 p-2 rounded-md transition-colors',
                      isSelected
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted border border-transparent',
                    )}
                  >
                    <span className="text-lg shrink-0">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ingredient.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="base"
                          className={join('capitalize text-xs', colorClass)}
                        >
                          {ingredient.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {ingredient.servingSize} {unitLabel} / serving
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={isSelected ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() =>
                        isSelected
                          ? handleRemove(ingredient.id)
                          : handleAdd(ingredient)
                      }
                      aria-label={
                        isSelected
                          ? `Remove ${ingredient.name}`
                          : `Add ${ingredient.name}`
                      }
                    >
                      {isSelected ? '✓ Added' : '+ Add'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create New Ingredient */}
          <div className="pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                closeModal();
                setIsCreateIngredientModalOpen(true);
              }}
            >
              + Create New Ingredient
            </Button>
          </div>
        </div>
      </Modal>

      <CreateIngredientModal
        isOpen={isCreateIngredientModalOpen}
        onClose={() => setIsCreateIngredientModalOpen(false)}
        onSelectManual={() => {
          setIsCreateIngredientModalOpen(false);
          navigate('/ingredients/new', { state: { fromMealPath } });
        }}
        onSelectBarcode={() => {
          setIsCreateIngredientModalOpen(false);
          navigate('/ingredients/new/barcode', { state: { fromMealPath } });
        }}
      />
    </div>
  );
}
