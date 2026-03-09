import { Modal, Button, Badge } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { PlannedMeal } from '@lib/calendar';
import { Meal, MEAL_CATEGORY_COLORS, MEAL_CATEGORY_EMOJIS } from '@lib/meals';
import { Ingredient } from '@lib/ingredients';
import { formatDateFull, getStartOfDay } from '@/utils';
import { calculateTotals } from '@/lib/calendar/calendar.utils';

export interface DayDetailModalProps {
  day: number | null;
  plannedMeals: PlannedMeal[];
  meals: Meal[];
  ingredients: Ingredient[];
  onClose: () => void;
  onEdit: (pm: PlannedMeal) => void;
  onDelete: (pm: PlannedMeal) => void;
}

export function DayDetailModal({ day, plannedMeals, meals, ingredients, onClose, onEdit, onDelete }: DayDetailModalProps) {
  if (day === null) return null;

  const dayMeals = plannedMeals.filter((pm) => getStartOfDay(pm.date) === day);

  const rows = dayMeals.map((pm) => {
    const meal = meals.find((m) => m.id === pm.mealId);
    const mealTotals = calculateTotals([pm], meals, ingredients);
    return { pm, meal, totals: mealTotals };
  });

  const grandTotal = calculateTotals(dayMeals, meals, ingredients);

  const handleEditAndClose = (pm: PlannedMeal) => {
    onEdit(pm);
    onClose();
  };

  return (
    <Modal
      isOpen={day !== null}
      onClose={onClose}
      title={`📊 ${formatDateFull(day)}`}
      actions={[{ label: 'Close', variant: 'secondary', onClick: onClose }]}
    >
      <div className="w-full">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No meals planned for this day.</p>
        ) : (
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-medium">Category</th>
                  <th className="text-left py-2 pr-3 font-medium">Meal</th>
                  <th className="text-right py-2 pr-3 font-medium">🔥 kcal</th>
                  <th className="text-right py-2 pr-3 font-medium">💪 g</th>
                  <th className="text-right py-2 pr-3 font-medium">🌾 g</th>
                  <th className="text-right py-2 pr-3 font-medium">🥑 g</th>
                  <th className="text-right py-2 font-medium">💰</th>
                </tr>
                <tr className="border-b border-border text-xs text-muted-foreground/60">
                  <th />
                  <th />
                  <th className="text-right py-1 pr-3 font-normal">Calories</th>
                  <th className="text-right py-1 pr-3 font-normal">Protein</th>
                  <th className="text-right py-1 pr-3 font-normal">Carbs</th>
                  <th className="text-right py-1 pr-3 font-normal">Fat</th>
                  <th className="text-right py-1 font-normal">Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ pm, meal, totals }) => (
                  <tr key={pm.id} className="border-b border-border/50 hover:bg-muted/30 group">
                    <td className="py-2 pr-3">
                      <Badge
                        variant="base"
                        className={join('capitalize text-xs', MEAL_CATEGORY_COLORS[pm.category])}
                      >
                        <span className="hidden sm:inline pr-1">{MEAL_CATEGORY_EMOJIS[pm.category] + ' '}</span>
                        {pm.category}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="font-medium text-foreground">{meal?.title ?? 'Unknown'}</div>
                      {pm.notes && (
                        <div className="text-xs text-muted-foreground mt-0.5">{pm.notes}</div>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{Math.round(totals.calories)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{Math.round(totals.protein)}g</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{Math.round(totals.carbs)}g</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{Math.round(totals.fat)}g</td>
                    <td className="py-2 text-right tabular-nums">${totals.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold text-foreground">
                  <td className="py-2 pr-3 text-xs text-muted-foreground" colSpan={2}>Day Total</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{Math.round(grandTotal.calories)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{Math.round(grandTotal.protein)}g</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{Math.round(grandTotal.carbs)}g</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{Math.round(grandTotal.fat)}g</td>
                  <td className="py-2 text-right tabular-nums">${grandTotal.price.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {rows.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Manage meals:</p>
            {rows.map(({ pm, meal }) => (
              <div key={pm.id} className="flex items-center justify-between gap-2 bg-muted/30 rounded-lg px-3 py-1.5">
                <span className="text-sm text-foreground truncate">{meal?.title ?? 'Unknown'}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="tertiary" size="sm" onClick={() => handleEditAndClose(pm)} aria-label="Edit">✏️</Button>
                  <Button variant="tertiary" size="sm" onClick={() => { onDelete(pm); }} aria-label="Remove">🗑️</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
