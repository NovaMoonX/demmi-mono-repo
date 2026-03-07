import { Card, Badge } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { Meal, MealCategory } from '@lib/meals';

const categoryColors: Record<MealCategory, string> = {
  breakfast: 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  lunch: 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  dinner: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  snack: 'bg-purple-500/20 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  dessert: 'bg-pink-500/20 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
  drink: 'bg-cyan-500/20 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
};

const categoryEmojis: Record<MealCategory, string> = {
  breakfast: '🌅',
  lunch: '🍱',
  dinner: '🌙',
  snack: '🍿',
  dessert: '🍰',
  drink: '🥤',
};

interface MealCardProps {
  meal: Meal;
  onClick?: (meal: Meal) => void;
}

export function MealCard({ meal, onClick }: MealCardProps) {
  const totalTime = meal.prepTime + meal.cookTime;

  const handleClick = () => {
    onClick?.(meal);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]">
      <div onClick={handleClick}>
      {/* Cover Image */}
      <div className="w-full h-48 overflow-hidden bg-muted">
        <img
          src={meal.imageUrl}
          alt={meal.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2394a3b8"%3EImage not available%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-xl font-semibold text-foreground">
              {meal.title}
            </h3>
            <span className="text-2xl shrink-0">
              {categoryEmojis[meal.category]}
            </span>
          </div>
          <Badge variant="base" className={join('capitalize', categoryColors[meal.category])}>
            {meal.category}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">
          {meal.description}
        </p>

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {meal.prepTime}m
            </div>
            <div className="text-xs text-muted-foreground">Prep</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {meal.cookTime}m
            </div>
            <div className="text-xs text-muted-foreground">Cook</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {meal.servingSize}
            </div>
            <div className="text-xs text-muted-foreground">
              {meal.servingSize === 1 ? 'Serving' : 'Servings'}
            </div>
          </div>
        </div>

        {/* Total time and instructions */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Time</span>
            <span className="font-semibold text-foreground">
              {totalTime} { totalTime === 1 ? 'minute' : 'minutes' }
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Instructions</span>
            <span className="font-semibold text-foreground">
              {meal.instructions.length} { meal.instructions.length === 1 ? 'step' : 'steps' }
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Ingredients</span>
            <span className="font-semibold text-foreground">
              {meal.ingredients.length} { meal.ingredients.length === 1 ? 'item' : 'items' }
            </span>
          </div>
        </div>
      </div>
      </div>
    </Card>
  );
}
