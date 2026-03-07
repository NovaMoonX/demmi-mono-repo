import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Badge, Select } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import {
  Ingredient,
  INGREDIENT_TYPE_EMOJIS,
  INGREDIENT_TYPE_COLORS,
} from '@lib/ingredients';
import { MealIngredient } from '@lib/meals';
import { capitalize } from '@utils/capitalize';

const MIN_SERVINGS = 0.1;

interface MealIngredientSelectorProps {
  ingredients: Ingredient[];
  selectedIngredients: MealIngredient[];
  onChange: (ingredients: MealIngredient[]) => void;
}

export function MealIngredientSelector({
  ingredients,
  selectedIngredients,
  onChange,
}: MealIngredientSelectorProps) {
  const navigate = useNavigate();
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
    const parsed = parseFloat(value);
    const servings = isNaN(parsed) || parsed < MIN_SERVINGS ? MIN_SERVINGS : parsed;
    const updated = selectedIngredients.map((si) =>
      si.ingredientId === ingredientId ? { ...si, servings } : si,
    );
    onChange(updated);
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
    <div className="space-y-4">
      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Selected Ingredients ({selectedIngredients.length})
          </p>
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
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <span className="text-xl shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {ingredient.name}
                    </p>
                    <Badge
                      variant="base"
                      className={join('capitalize text-xs', colorClass)}
                    >
                      {ingredient.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Input
                      type="number"
                      min={MIN_SERVINGS}
                      step="0.1"
                      value={si.servings.toString()}
                      onChange={(e) =>
                        handleServingsChange(si.ingredientId, e.target.value)
                      }
                      className="w-20 text-center"
                      aria-label={`Servings for ${ingredient.name}`}
                    />
                    <span className="text-xs text-muted-foreground w-12 truncate">
                      {unitLabel}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(si.ingredientId)}
                      aria-label={`Remove ${ingredient.name}`}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
        <div className="w-40">
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
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-3">No ingredients found.</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/ingredients/new')}
          >
            + Add New Ingredient
          </Button>
        </div>
      ) : filteredIngredients.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No ingredients match your search.
        </p>
      ) : (
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
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
                  <div className="flex items-center gap-2">
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

      {/* Add new ingredient on the fly */}
      {ingredients.length > 0 && (
        <div className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/ingredients/new')}
          >
            + Create New Ingredient
          </Button>
        </div>
      )}
    </div>
  );
}
