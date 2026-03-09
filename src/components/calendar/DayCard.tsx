import { useMemo } from 'react';
import { Card, Button, Badge } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { NutrientTotals, PlannedMeal } from '@lib/calendar';
import { Meal, MEAL_CATEGORIES, MEAL_CATEGORY_COLORS, MEAL_CATEGORY_EMOJIS, MealCategory } from '@lib/meals';
import { Ingredient } from '@lib/ingredients';
import { formatDateShort, formatDayShort } from '@/utils';
import { calculateTotals } from '@/lib/calendar/calendar.utils';

export interface DayCardProps {
  day: number;
  plannedMeals: PlannedMeal[];
  meals: Meal[];
  ingredients: Ingredient[];
  compact: boolean;
  onAdd: (date: number, category?: MealCategory) => void;
  onEdit: (pm: PlannedMeal) => void;
  onViewDetail: (day: number) => void;
  onGoToDay: (day: number) => void;
}

export function DayCard({ day, plannedMeals, meals, ingredients, compact, onAdd, onEdit, onViewDetail, onGoToDay }: DayCardProps) {
  const hasMeals = plannedMeals.length > 0;

  const dayTotals = useMemo(
    () => calculateTotals(plannedMeals, meals, ingredients),
    [plannedMeals, meals, ingredients]
  );

  const mealStats = useMemo(() => {
    if (compact) return new Map<string, NutrientTotals>();
    const map = new Map<string, NutrientTotals>();
    for (const pm of plannedMeals) {
      map.set(pm.id, calculateTotals([pm], meals, ingredients));
    }
    return map;
  }, [compact, plannedMeals, meals, ingredients]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          {compact ? (
            <div
              className="cursor-pointer group"
              onClick={() => onGoToDay(day)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGoToDay(day); } }}
              aria-label={`Go to day view for ${formatDateShort(day)}`}
            >
              <p className="text-xs font-medium text-muted-foreground uppercase group-hover:text-primary transition-colors">
                {formatDayShort(day)}
              </p>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary group-hover:underline underline-offset-2 transition-colors">{formatDateShort(day)}</p>
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-foreground">{new Date(day).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</h2>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {hasMeals && compact && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => onViewDetail(day)}
              aria-label="View day details"
              className="text-xs"
            >
              📊
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => onAdd(day)}>
            + Add
          </Button>
        </div>
      </div>

      {!hasMeals ? (
        <p className="text-xs text-muted-foreground text-center py-3">No meals planned.</p>
      ) : (
        <div className="space-y-3">
          {MEAL_CATEGORIES.map((cat) => {
            const catMeals = plannedMeals.filter((pm) => pm.category === cat);
            if (catMeals.length === 0) return null;

            return (
              <div key={cat}>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>{MEAL_CATEGORY_EMOJIS[cat]}</span>
                  <span className="capitalize">{cat}</span>
                </p>
                <div className="space-y-1">
                  {catMeals.map((pm) => {
                    const meal = meals.find((m) => m.id === pm.mealId);
                    const mealEmoji = (meal && MEAL_CATEGORY_EMOJIS[meal.category]) ? MEAL_CATEGORY_EMOJIS[meal.category] : MEAL_CATEGORY_EMOJIS[cat];
                    const stats = !compact ? mealStats.get(pm.id) : undefined;
                    return (
                      <div
                        key={pm.id}
                        className="rounded py-1 cursor-pointer hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => onEdit(pm)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(pm); } }}
                        aria-label={`Edit ${meal?.title ?? 'meal'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground truncate">
                            {meal?.title ?? 'Unknown Meal'}
                          </span>
                          <Badge
                            variant="base"
                            className={join('shrink-0 text-xs', MEAL_CATEGORY_COLORS[cat])}
                          >
                            {mealEmoji}
                          </Badge>
                        </div>
                        {!compact && pm.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{pm.notes}</p>
                        )}
                        {!compact && stats && (
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>🔥 {Math.round(stats.calories)} kcal</span>
                            <span>💪 {Math.round(stats.protein)}g</span>
                            <span>🌾 {Math.round(stats.carbs)}g</span>
                            <span>🥑 {Math.round(stats.fat)}g</span>
                            <span>💰 ${stats.price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMeals && (
        <div className="mt-3 pt-3 border-t border-border">
          {compact ? (
            <>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>🔥 {Math.round(dayTotals.calories)} kcal</span>
                <span>💪 {Math.round(dayTotals.protein)}g</span>
                <span>💰 ${dayTotals.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1">Tap 📊 for full breakdown</p>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-foreground">
              <span>🔥 {Math.round(dayTotals.calories)} kcal</span>
              <span>💪 {Math.round(dayTotals.protein)}g</span>
              <span>🌾 {Math.round(dayTotals.carbs)}g</span>
              <span>🥑 {Math.round(dayTotals.fat)}g</span>
              <span>💰 ${dayTotals.price.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-3 pt-3 border-t border-border">
        {MEAL_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant="tertiary"
            size="sm"
            onClick={() => onAdd(day, cat)}
            className="text-xs border border-dashed border-border"
          >
            {MEAL_CATEGORY_EMOJIS[cat]} +
          </Button>
        ))}
      </div>
    </Card>
  );
}
