import {
  INGREDIENT_PLACEHOLDER_IMAGE_URL,
  INGREDIENT_TYPE_COLORS,
  INGREDIENT_TYPE_EMOJIS,
} from '@lib/ingredients';
import type { Ingredient } from '@lib/ingredients';
import { Badge, Card } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';

const FALLBACK_IMAGE_URL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2394a3b8"%3EImage not available%3C/text%3E%3C/svg%3E';

interface IngredientCardProps {
  ingredient: Ingredient;
  onClick: () => void;
}

export function IngredientCard({ ingredient, onClick }: IngredientCardProps) {
  const servingsCount =
    ingredient.servingSize > 0
      ? ingredient.currentAmount / ingredient.servingSize
      : 0;
  const servingsRounded = Math.round(servingsCount * 10) / 10;
  const servingsDisplay = Number.isFinite(servingsRounded)
    ? servingsRounded
    : 0;
  const servingsLabel = `${servingsDisplay} servings`;
  const servingSizeLabel = `${ingredient.servingSize} ${ingredient.unit}`;

  const footer = (
    <div className='text-muted-foreground flex items-center justify-between text-xs'>
      <div className='flex flex-col gap-1'>
        <span className='tracking-wide uppercase'>Servings</span>
        <span className='text-foreground text-sm font-semibold'>
          {servingsLabel}
        </span>
      </div>
      <div className='flex flex-col items-end gap-1'>
        <span className='tracking-wide uppercase'>Serving size</span>
        <span className='text-foreground text-sm font-semibold'>
          {servingSizeLabel}
        </span>
      </div>
    </div>
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="cursor-pointer"
    >
      <Card
        className='flex h-full flex-col overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]'
        footer={footer}
      >
        <div className='bg-muted h-40 w-full overflow-hidden'>
          <img
            src={ingredient.imageUrl || INGREDIENT_PLACEHOLDER_IMAGE_URL}
            alt={ingredient.name}
            className='h-full w-full object-cover'
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE_URL;
            }}
          />
        </div>

        <div className='flex flex-col gap-3 p-4'>
          <div>
            <div className='mb-2 flex items-start justify-between gap-2'>
              <h3 className='text-foreground text-lg font-semibold'>
                {ingredient.name}
              </h3>
              <span className='shrink-0 text-xl'>
                {INGREDIENT_TYPE_EMOJIS[ingredient.type]}
              </span>
            </div>
            <Badge
              variant='base'
              className={join(
                'capitalize',
                INGREDIENT_TYPE_COLORS[ingredient.type],
              )}
            >
              {ingredient.type}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
