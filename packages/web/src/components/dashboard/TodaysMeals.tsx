import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useAppSelector } from '@store/hooks';
import { RECIPE_CATEGORY_EMOJIS, RECIPE_CATEGORY_COLORS } from '@lib/recipes';
import type { RecipeCategory } from '@lib/recipes';

const MEAL_ORDER: RecipeCategory[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'];

export function TodaysMeals() {
  const navigate = useNavigate();
  const plannedRecipes = useAppSelector((state) => state.calendar.plannedRecipes);
  const recipes = useAppSelector((state) => state.recipes.items);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTimestamp = todayStart.getTime();

  const todaysMeals = plannedRecipes
    .filter((pr) => pr.date === todayTimestamp)
    .sort((a, b) => MEAL_ORDER.indexOf(a.category) - MEAL_ORDER.indexOf(b.category));

  if (todaysMeals.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-3">
          <p className="text-4xl">📅</p>
          <p className="text-foreground/70">
            Nothing planned for today — want to add something?
          </p>
          <Button onClick={() => navigate('/calendar')} variant="outline">
            Plan a meal
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Today&apos;s Meals</h2>
      <div className="space-y-3">
        {todaysMeals.map((meal) => {
          const recipe = recipes.find((r) => r.id === meal.recipeId);
          const emoji = RECIPE_CATEGORY_EMOJIS[meal.category];
          const colorClass = RECIPE_CATEGORY_COLORS[meal.category];
          const categoryLabel = meal.category.charAt(0).toUpperCase() + meal.category.slice(1);

          return (
            <div
              key={meal.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={join(
                    'shrink-0 rounded-md px-2 py-1 text-sm font-medium',
                    colorClass,
                  )}
                >
                  {emoji} {categoryLabel}
                </span>
                <span className="truncate text-sm font-medium">
                  {recipe?.title ?? 'Unknown recipe'}
                </span>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate(`/recipes/${meal.recipeId}`)}
              >
                Open
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
