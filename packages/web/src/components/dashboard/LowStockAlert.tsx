import { Callout, Button } from '@moondreamsdev/dreamer-ui/components';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { createShoppingListItem } from '@store/actions/shoppingListActions';

const MAX_DISPLAY_ITEMS = 5;

export function LowStockAlert() {
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector((state) => state.ingredients.items);

  const lowStockItems = ingredients.filter((ing) => ing.currentAmount <= 0);

  if (lowStockItems.length === 0) {
    return null;
  }

  const displayedItems = lowStockItems.slice(0, MAX_DISPLAY_ITEMS);

  const handleAddToShoppingList = (ingredientId: string, ingredientName: string) => {
    dispatch(
      createShoppingListItem({
        name: ingredientName,
        ingredientId,
        productId: null,
        amount: null,
        unit: null,
        category: 'other',
        note: null,
        checked: false,
      }),
    );
  };

  return (
    <Callout
      variant="warning"
      title="Low Stock Items"
      description={
        <div className="space-y-2 mt-2">
          {displayedItems.map((ing) => (
            <div
              key={ing.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-sm truncate">{ing.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddToShoppingList(ing.id, ing.name)}
              >
                Add to shopping list
              </Button>
            </div>
          ))}
          {lowStockItems.length > MAX_DISPLAY_ITEMS && (
            <p className="text-xs text-foreground/60 mt-1">
              +{lowStockItems.length - MAX_DISPLAY_ITEMS} more items low on stock
            </p>
          )}
        </div>
      }
    />
  );
}
