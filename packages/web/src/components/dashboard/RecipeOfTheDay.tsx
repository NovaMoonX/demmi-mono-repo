import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { createPlannedRecipe } from '@store/actions/calendarActions';
import {
  RECIPE_CATEGORY_EMOJIS,
  RECIPE_CATEGORY_COLORS,
} from '@lib/recipes';

function getTodayDateHash(): number {
  const now = new Date();
  const result = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return result;
}

function getTodayStartTimestamp(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const result = d.getTime();
  return result;
}

export function RecipeOfTheDay() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const recipes = useAppSelector((state) => state.recipes.items);
  const plannedRecipes = useAppSelector((state) => state.calendar.plannedRecipes);
  const userProfile = useAppSelector((state) => state.userProfile.profile);

  const recipeOfTheDay = useMemo(() => {
    if (recipes.length === 0) return null;

    const cuisinePrefs = userProfile?.cuisinePreferences ?? [];
    const todayTimestamp = getTodayStartTimestamp();

    const recentRecipeIds = new Set(
      plannedRecipes
        .filter((pr) => pr.date >= todayTimestamp - 7 * 24 * 60 * 60 * 1000)
        .map((pr) => pr.recipeId),
    );

    let candidates = recipes.filter((r) => !recentRecipeIds.has(r.id));

    if (cuisinePrefs.length > 0) {
      const preferred = candidates.filter((r) => cuisinePrefs.includes(r.cuisine));
      if (preferred.length > 0) {
        candidates = preferred;
      }
    }

    if (candidates.length === 0) {
      candidates = recipes;
    }

    const dateHash = getTodayDateHash();
    const index = dateHash % candidates.length;
    const result = candidates[index];
    return result;
  }, [recipes, plannedRecipes, userProfile]);

  if (recipes.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-3">
          <p className="text-4xl">🍽️</p>
          <p className="text-foreground/70">
            Your recipe collection is empty — add your first recipe 🍽️
          </p>
          <Button onClick={() => navigate('/recipes/new')} variant="outline">
            Add a recipe
          </Button>
        </div>
      </Card>
    );
  }

  if (!recipeOfTheDay) return null;

  const emoji = RECIPE_CATEGORY_EMOJIS[recipeOfTheDay.category];
  const colorClass = RECIPE_CATEGORY_COLORS[recipeOfTheDay.category];

  const handleCookTonight = () => {
    const todayTimestamp = getTodayStartTimestamp();
    dispatch(
      createPlannedRecipe({
        recipeId: recipeOfTheDay.id,
        date: todayTimestamp,
        category: 'dinner',
        notes: null,
      }),
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Recipe of the Day</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            className={join(
              'shrink-0 rounded-md px-2 py-1 text-sm font-medium',
              colorClass,
            )}
          >
            {emoji} {recipeOfTheDay.category.charAt(0).toUpperCase() + recipeOfTheDay.category.slice(1)}
          </span>
        </div>
        <h3 className="text-xl font-bold">{recipeOfTheDay.title}</h3>
        <p className="text-sm text-foreground/70 line-clamp-2">
          {recipeOfTheDay.description}
        </p>
        <div className="flex gap-2 pt-1">
          <Button onClick={handleCookTonight} size="sm">
            Cook this tonight
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => navigate(`/recipes/${recipeOfTheDay.id}`)}
          >
            View recipe
          </Button>
        </div>
      </div>
    </Card>
  );
}
