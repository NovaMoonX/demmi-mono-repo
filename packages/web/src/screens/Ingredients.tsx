import { capitalize } from '@/utils';
import {
  INGREDIENT_TYPE_EMOJIS,
} from '@lib/ingredients';
import {
  Button,
  Input,
  Select,
  Toggle,
} from '@moondreamsdev/dreamer-ui/components';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';
import { CreateIngredientModal, IngredientCard } from '@components/ingredients';

export function Ingredients() {
  const navigate = useNavigate();
  const ingredients = useAppSelector((state) => state.ingredients.items);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState('name-asc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
  }, [outOfStockOnly, searchQuery, sortOption, typeFilter, ingredients]);

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
      <CreateIngredientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSelectManual={() => navigate('/ingredients/new')}
        onSelectBarcode={() => navigate('/ingredients/new/barcode')}
        onSelectBarcodeEntry={() => navigate('/ingredients/new/barcode-entry')}
      />
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
            onClick={() => setIsCreateModalOpen(true)}
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
          filteredIngredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onClick={() => navigate(`/ingredients/${ingredient.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Ingredients;
