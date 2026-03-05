import { capitalize } from '@/utils';
import {
  INGREDIENT_TYPE_COLORS,
  INGREDIENT_TYPE_EMOJIS,
} from '@lib/ingredients';
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
  Toggle,
} from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';

const FALLBACK_IMAGE_URL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2394a3b8"%3EImage not available%3C/text%3E%3C/svg%3E';

export function Ingredients() {
  const navigate = useNavigate();
  const ingredients = useAppSelector((state) => state.ingredients.items);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState('name-asc');

  const filteredIngredients = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const filtered = ingredients.filter((ingredient) => {
      const matchesSearch = ingredient.name.toLowerCase().includes(query);
      const matchesType =
        typeFilter === 'all' || ingredient.type === typeFilter;
      const matchesStock = !outOfStockOnly || ingredient.currentAmount <= 0;
      const matchesAll = matchesSearch && matchesType && matchesStock;

      return matchesAll;
    });

    const sorted = [...filtered].sort((a, b) => {
      const servingsA = a.servingSize > 0 ? a.currentAmount / a.servingSize : 0;
      const servingsB = b.servingSize > 0 ? b.currentAmount / b.servingSize : 0;

      if (sortOption === 'name-asc') {
        const result = a.name.localeCompare(b.name);
        return result;
      }

      if (sortOption === 'name-desc') {
        const result = b.name.localeCompare(a.name);
        return result;
      }

      if (sortOption === 'servings-asc') {
        const result = servingsA - servingsB;
        return result;
      }

      const result = servingsB - servingsA;
      return result;
    });

    return sorted;
  }, [outOfStockOnly, searchQuery, sortOption, typeFilter]);

  const typeOption = useMemo(() => {
    const options = Object.entries(INGREDIENT_TYPE_EMOJIS).map(
      ([type, emoji]) => ({
        value: type,
        text: `${emoji} ${capitalize(type)}`,
      }),
    );
    return [{ value: 'all', text: 'All Types' }, ...options];
  }, []);

  const sortOptions = useMemo(() => {
    const options = [
      { value: 'name-asc', text: 'Name (A-Z)' },
      { value: 'name-desc', text: 'Name (Z-A)' },
      { value: 'servings-asc', text: 'Servings (Low to High)' },
      { value: 'servings-desc', text: 'Servings (High to Low)' },
    ];
    return options;
  }, []);

  return (
    <div className='mx-auto max-w-7xl p-6 mt-10 md:mt-0'>
      <div className='mb-8'>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className='text-foreground mb-2 text-4xl font-bold'>Ingredients</h1>
            <p className='text-muted-foreground mb-6'>
              Browse and manage your ingredients inventory
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => navigate('/ingredients/new')}
          >
            Create Ingredient
          </Button>
        </div>

        {/* Search and Filters */}
        <div className='mb-4 flex flex-col gap-4 md:flex-row'>
          <Input
            type='text'
            placeholder='Search ingredients by name...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='flex-1'
          />
        </div>

        <div className='flex flex-col items-start gap-4 sm:flex-row'>
          <Select
            options={typeOption}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            placeholder='Filter by type'
            className='sm:w-64'
          />
          <Select
            options={sortOptions}
            value={sortOption}
            onChange={(value) => setSortOption(value)}
            placeholder='Sort by'
            className='sm:w-64'
          />
          <div className='flex items-center gap-3 px-3 py-2'>
            <Toggle
              checked={outOfStockOnly}
              onCheckedChange={setOutOfStockOnly}
              aria-label='Filter by out of stock items'
            />
            <span className='text-foreground text-sm'>Out of Stock Only</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {filteredIngredients.length === 0 ? (
          <div className='col-span-full py-12 text-center'>
            <p className='text-muted-foreground text-lg'>
              No ingredients found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          filteredIngredients.map((ingredient) => {
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

            const handleClick = () => {
              navigate(`/ingredients/${ingredient.id}`);
            };

            const handleKeyDown = (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/ingredients/${ingredient.id}`);
              }
            };

            return (
              <div
                key={ingredient.id}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                className="cursor-pointer"
              >
                <Card
                  className='flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg'
                  footer={footer}
                >
                {/* Cover Image */}
                <div className='bg-muted h-40 w-full overflow-hidden'>
                  <img
                    src={ingredient.imageUrl}
                    alt={ingredient.name}
                    className='h-full w-full object-cover'
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE_URL;
                    }}
                  />
                </div>

                <div className='flex flex-col gap-3 p-4'>
                  {/* Header */}
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
          })
        )}
      </div>
    </div>
  );
}

export default Ingredients;
