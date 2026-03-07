import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Input,
  Textarea,
  Select,
  Button,
  DynamicList,
  Modal,
  Label,
} from '@moondreamsdev/dreamer-ui/components';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { Meal, MealCategory, MealIngredient } from '@lib/meals';
import { MEASUREMENT_UNIT_LABELS } from '@lib/ingredients';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { createMeal, updateMeal, deleteMeal } from '@store/slices/mealsSlice';
import type { DynamicListItem } from '@moondreamsdev/dreamer-ui/components';

type MealIngredientListItemData = {
  ingredientId: string;
  servings: number;
  unit: string;
};

export function MealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const meals = useAppSelector((state) => state.meals.items);
  const allIngredients = useAppSelector((state) => state.ingredients.items);
  const { confirm } = useActionModal();

  const isEditing = id !== 'new';
  const existingMeal = isEditing ? meals.find((m) => m.id === id) : undefined;

  const fromMealPath =
    isEditing && existingMeal ? `/meals/${existingMeal.id}` : '/meals/new';

  const [title, setTitle] = useState(existingMeal?.title || '');
  const [description, setDescription] = useState(
    existingMeal?.description || '',
  );
  const [category, setCategory] = useState<string>(
    existingMeal?.category || 'breakfast',
  );
  const [prepTime, setPrepTime] = useState(
    existingMeal?.prepTime.toString() || '0',
  );
  const [cookTime, setCookTime] = useState(
    existingMeal?.cookTime.toString() || '0',
  );
  const [servingSize, setServingSize] = useState(
    existingMeal?.servingSize.toString() || '1',
  );
  const [imageUrl, setImageUrl] = useState<string>(
    existingMeal?.imageUrl || '',
  );
  const [instructions, setInstructions] = useState<DynamicListItem<object>[]>(
    existingMeal?.instructions.map((inst, index) => ({
      id: `inst-${index}`,
      content: inst,
    })) || [],
  );
  const [mealIngredientItems, setMealIngredientItems] = useState<
    DynamicListItem<MealIngredientListItemData>[]
  >(() => {
    if (!existingMeal) {
      return [];
    }

    const result = existingMeal.ingredients.map((ingredient, index) => {
      const ing = allIngredients.find((i) => i.id === ingredient.ingredientId);
      const unitValue =
        ing?.unit === 'other' && ing.otherUnit
          ? ing.otherUnit
          : (ing?.unit ?? 'unit');

      return {
        id: `meal-ing-${index}`,
        content: ingredient.ingredientId,
        ingredientId: ingredient.ingredientId,
        servings: ingredient.servings,
        unit: unitValue,
      };
    });

    return result;
  });
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [ingredientModalItemId, setIngredientModalItemId] = useState<
    string | null
  >(null);
  const [ingredientModalIngredientId, setIngredientModalIngredientId] =
    useState('');
  const [ingredientModalServings, setIngredientModalServings] = useState('1');
  const [ingredientModalUnit, setIngredientModalUnit] = useState('');
  const [ingredientModalCustomUnit, setIngredientModalCustomUnit] =
    useState('');

  const ingredientOptions = allIngredients.map((ingredient) => ({
    value: ingredient.id,
    text: ingredient.name,
  }));

  const unitOptions = Object.entries(MEASUREMENT_UNIT_LABELS).map(
    ([unitKey, label]) => ({
      value: unitKey,
      text: label,
    }),
  );

  // Auto-add a newly created ingredient when returning from the ingredient creation flow
  const processedNewIngredientRef = useRef<string | null>(null);
  useEffect(() => {
    const state = location.state as { newIngredientId?: string } | null;
    const newId = state?.newIngredientId;
    if (newId && newId !== processedNewIngredientRef.current) {
      const ing = allIngredients.find((i) => i.id === newId);
      if (ing) {
        processedNewIngredientRef.current = newId;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMealIngredientItems((prev) => {
          if (prev.some((item) => item.ingredientId === newId)) {
            return prev;
          }

          const unitValue =
            ing.unit === 'other' && ing.otherUnit ? ing.otherUnit : ing.unit;
          const result = [
            ...prev,
            {
              id: `meal-ing-${newId}`,
              content: newId,
              ingredientId: newId,
              servings: 1,
              unit: unitValue,
            },
          ];

          return result;
        });
      }
    }
  }, [location.state, allIngredients]);

  const availableIngredientOptions = ingredientOptions.filter(
    (option) =>
      !mealIngredientItems.some((item) => item.ingredientId === option.value),
  );

  const handleIngredientChange = (ingredientId: string) => {
    setIngredientModalIngredientId(ingredientId);

    const ing = allIngredients.find((i) => i.id === ingredientId);
    if (ing) {
      if (ing.unit === 'other' && ing.otherUnit) {
        setIngredientModalUnit('other');
        setIngredientModalCustomUnit(ing.otherUnit);
      } else {
        setIngredientModalUnit(ing.unit);
        setIngredientModalCustomUnit('');
      }
    }
  };

  const updateIngredientItem = (
    itemId: string,
    updates: Partial<DynamicListItem<MealIngredientListItemData>>,
  ) => {
    setMealIngredientItems((prev) => {
      const nextIngredientId = updates.ingredientId;

      if (
        nextIngredientId &&
        prev.some(
          (item) =>
            item.id !== itemId && item.ingredientId === nextIngredientId,
        )
      ) {
        return prev;
      }

      const result = prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const updatedItem = {
          ...item,
          ...updates,
        };

        return updatedItem;
      });

      return result;
    });
  };
  
  const getIngredientById = (ingredientId: string) => {
    const result = allIngredients.find(
      (ingredient) => ingredient.id === ingredientId,
    );
    return result;
  };

  const getIngredientUnitById = (ingredientId: string) => {
    const ingredient = getIngredientById(ingredientId);

    if (!ingredient) {
      return 'unit';
    }

    if (ingredient.unit === 'other' && ingredient.otherUnit) {
      const result = ingredient.otherUnit;
      return result;
    }

    const result = ingredient.unit;
    return result;
  };

  const openAddIngredientModal = () => {
    const firstOption = availableIngredientOptions[0];
    const nextIngredientId = firstOption?.value ?? '';
    const ing = allIngredients.find((i) => i.id === nextIngredientId);

    let nextUnit = ing?.unit ?? 'g';
    let nextCustomUnit = '';
    if (ing?.unit === 'other' && ing.otherUnit) {
      nextUnit = 'other';
      nextCustomUnit = ing.otherUnit;
    }

    setIngredientModalItemId(null);
    setIngredientModalIngredientId(nextIngredientId);
    setIngredientModalServings('1');
    setIngredientModalUnit(nextUnit);
    setIngredientModalCustomUnit(nextCustomUnit);
    setIsIngredientModalOpen(true);
  };

  const openEditIngredientModal = (
    item: DynamicListItem<MealIngredientListItemData>,
  ) => {
    // Determine if the stored unit is the base unit or a custom one
    let modalUnit = item.unit;
    let modalCustomUnit = '';

    // Check if this is a standard unit
    const isStandardUnit = Object.keys(MEASUREMENT_UNIT_LABELS).includes(
      item.unit,
    );

    if (isStandardUnit) {
      modalUnit = item.unit;
    } else {
      // Custom unit - show as "other" with custom text
      modalUnit = 'other';
      modalCustomUnit = item.unit;
    }

    setIngredientModalItemId(item.id);
    setIngredientModalIngredientId(item.ingredientId);
    setIngredientModalServings(item.servings.toString());
    setIngredientModalUnit(modalUnit);
    setIngredientModalCustomUnit(modalCustomUnit);
    setIsIngredientModalOpen(true);
  };

  const closeIngredientModal = () => {
    setIsIngredientModalOpen(false);
    setIngredientModalItemId(null);
    setIngredientModalIngredientId('');
    setIngredientModalServings('1');
    setIngredientModalUnit('');
    setIngredientModalCustomUnit('');
  };

  const handleSaveIngredientModal = () => {
    if (!ingredientModalIngredientId) {
      return;
    }

    const parsedServings = parseFloat(ingredientModalServings);
    const nextServings =
      Number.isNaN(parsedServings) || parsedServings <= 0
        ? 0.1
        : parsedServings;

    let nextUnit =
      ingredientModalUnit.trim() ||
      getIngredientUnitById(ingredientModalIngredientId);
    if (nextUnit === 'other' && ingredientModalCustomUnit.trim()) {
      nextUnit = ingredientModalCustomUnit.trim();
    }

    if (ingredientModalItemId) {
      updateIngredientItem(ingredientModalItemId, {
        ingredientId: ingredientModalIngredientId,
        servings: nextServings,
        unit: nextUnit,
      });
      closeIngredientModal();
      return;
    }

    setMealIngredientItems((prev) => {
      if (
        prev.some((item) => item.ingredientId === ingredientModalIngredientId)
      ) {
        return prev;
      }

      const result = [
        ...prev,
        {
          id: `meal-ing-${Date.now()}`,
          content: ingredientModalIngredientId,
          ingredientId: ingredientModalIngredientId,
          servings: nextServings,
          unit: nextUnit,
        },
      ];

      return result;
    });

    closeIngredientModal();
  };

  const categoryOptions = [
    { value: 'breakfast', text: '🌅 Breakfast' },
    { value: 'lunch', text: '🍱 Lunch' },
    { value: 'dinner', text: '🌙 Dinner' },
    { value: 'snack', text: '🍿 Snack' },
    { value: 'dessert', text: '🍰 Dessert' },
    { value: 'drink', text: '🥤 Drink' },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (result && typeof result === 'string') {
          setImageUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const instructionsList = instructions
      .map((item) => (typeof item.content === 'string' ? item.content : ''))
      .filter((line) => line.trim().length > 0);

    const selectedIngredients: MealIngredient[] = mealIngredientItems
      .filter((item) => item.ingredientId.trim().length > 0)
      .map((item) => ({
        ingredientId: item.ingredientId,
        servings: item.servings > 0 ? item.servings : 1,
      }));

    const mealData: Omit<Meal, 'id'> = {
      title,
      description,
      category: category as MealCategory,
      prepTime: parseInt(prepTime, 10) || 0,
      cookTime: parseInt(cookTime, 10) || 0,
      servingSize: parseInt(servingSize, 10) || 1,
      imageUrl: imageUrl,
      instructions: instructionsList,
      ingredients: selectedIngredients,
    };

    if (isEditing && existingMeal) {
      dispatch(updateMeal({ id: existingMeal.id, updates: mealData }));
    } else {
      dispatch(createMeal(mealData));
    }

    navigate('/meals');
  };

  const handleDelete = async () => {
    if (!existingMeal) return;

    const confirmed = await confirm({
      title: 'Delete Meal',
      message: `Are you sure you want to delete "${existingMeal.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (confirmed) {
      dispatch(deleteMeal(existingMeal.id));
      navigate('/meals');
    }
  };

  const handleCancel = () => {
    navigate('/meals');
  };

  return (
    <div className='mx-auto mt-10 max-w-4xl p-6 md:mt-0'>
      <div className='mb-8'>
        <Link
          to='/meals'
          className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
        >
          ← Back to Meals
        </Link>
        <h1 className='text-foreground mb-2 text-4xl font-bold'>
          {isEditing ? 'Edit Meal' : 'Create New Meal'}
        </h1>
        <p className='text-muted-foreground'>
          {isEditing
            ? 'Update the details of your meal recipe'
            : 'Add a new meal to your collection'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label
            htmlFor='title'
            className='text-foreground mb-1 block text-sm font-medium'
          >
            Title *
          </label>
          <Input
            id='title'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter meal title'
            required
          />
        </div>

        <div>
          <label
            htmlFor='description'
            className='text-foreground mb-1 block text-sm font-medium'
          >
            Description *
          </label>
          <Textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Enter meal description'
            required
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor='category'
            className='text-foreground mb-1 block text-sm font-medium'
          >
            Category *
          </label>
          <Select
            options={categoryOptions}
            value={category}
            onChange={(value) => setCategory(value)}
            placeholder='Select category'
          />
        </div>

        <div className='grid grid-cols-3 items-end gap-4'>
          <div className='flex flex-col'>
            <label
              htmlFor='prepTime'
              className='text-foreground mb-1 block min-h-10 text-sm font-medium sm:min-h-0'
            >
              Prep Time (min) *
            </label>
            <Input
              id='prepTime'
              type='number'
              min='0'
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              required
            />
          </div>

          <div className='flex flex-col'>
            <label
              htmlFor='cookTime'
              className='text-foreground mb-1 block min-h-10 text-sm font-medium sm:min-h-0'
            >
              Cook Time (min) *
            </label>
            <Input
              id='cookTime'
              type='number'
              min='0'
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              required
            />
          </div>

          <div className='flex flex-col'>
            <label
              htmlFor='servingSize'
              className='text-foreground mb-1 block min-h-10 text-sm font-medium sm:min-h-0'
            >
              Servings *
            </label>
            <Input
              id='servingSize'
              type='number'
              min='1'
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor='image'
            className='text-foreground mb-1 block text-sm font-medium'
          >
            Meal Image
          </label>
          <input
            id='image'
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            className='text-foreground file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 block w-full text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium'
          />
          {imageUrl && (
            <div className='mt-4'>
              <p className='text-muted-foreground mb-2 text-sm'>
                Image Preview:
              </p>
              <img
                src={imageUrl}
                alt='Meal preview'
                className='border-border h-48 w-full max-w-md rounded-lg border object-cover'
              />
            </div>
          )}
        </div>

        <div>
          <label className='text-foreground mb-2 block text-sm font-medium'>
            Ingredients
          </label>
          <div className='space-y-3'>
            {mealIngredientItems.length > 0 ? (
              <ul className='border-border divide-border divide-y rounded-lg border'>
                {mealIngredientItems.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => openEditIngredientModal(item)}
                    className='hover:bg-muted flex cursor-pointer items-center text-sm justify-between gap-4 px-3 py-2 transition-colors list-disc list-inside'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-foreground'>
                        <b>
                          {item.servings} {item.unit}
                          {item.servings === 1 ? '' : 's'}
                        </b>{' '}
                        {getIngredientById(item.ingredientId)?.name ??
                          'Unknown ingredient'}
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='destructive'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation();
                          setMealIngredientItems((prev) =>
                            prev.filter((i) => i.id !== item.id),
                          );
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-muted-foreground text-sm'>
                No ingredients added yet. Click "Add Ingredient" to get
                started.
              </p>
            )}

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='tertiary'
                size='sm'
                onClick={openAddIngredientModal}
                disabled={availableIngredientOptions.length === 0}
              >
                + Add Ingredient
              </Button>
              <Button
                type='button'
                variant='tertiary'
                size='sm'
                onClick={() =>
                  navigate('/ingredients/new', { state: { fromMealPath } })
                }
              >
                + Create New Ingredient
              </Button>
            </div>

            <Modal
              isOpen={isIngredientModalOpen}
              onClose={closeIngredientModal}
              title={
                ingredientModalItemId ? 'Edit Ingredient' : 'Add Ingredient'
              }
              actions={[
                {
                  label: 'Cancel',
                  variant: 'secondary',
                  onClick: closeIngredientModal,
                },
                {
                  label: ingredientModalItemId
                    ? 'Save Changes'
                    : 'Add Ingredient',
                  variant: 'primary',
                  onClick: handleSaveIngredientModal,
                },
              ]}
            >
              <div className='w-full space-y-3 sm:min-w-96'>
                <div>
                  <label className='text-foreground mb-1 block text-sm font-medium'>
                    Ingredient
                  </label>
                  <Select
                    options={ingredientOptions}
                    value={ingredientModalIngredientId}
                    onChange={handleIngredientChange}
                    placeholder='Select ingredient'
                  />
                </div>
                <div>
                  <label className='text-foreground mb-1 block text-sm font-medium'>
                    Quantity
                  </label>
                  <Input
                    type='number'
                    min='0.1'
                    step='0.1'
                    value={ingredientModalServings}
                    onChange={(e) => setIngredientModalServings(e.target.value)}
                    placeholder='Enter quantity'
                  />
                </div>
                <div>
                  <label className='text-foreground mb-1 block text-sm font-medium'>
                    Unit
                  </label>
                  <Select
                    options={unitOptions}
                    value={ingredientModalUnit}
                    onChange={(value) => setIngredientModalUnit(value)}
                    placeholder='Select unit'
                  />
                </div>
                {ingredientModalUnit === 'other' && (
                  <div>
                    <Label
                      htmlFor='ingredient-custom-unit'
                      description='Enter unit in its singular form (e.g "serving" instead of "servings")'
                    >
                      Custom Unit
                    </Label>
                    <Input
                      id='ingredient-custom-unit'
                      type='text'
                      value={ingredientModalCustomUnit}
                      onChange={(e) =>
                        setIngredientModalCustomUnit(e.target.value)
                      }
                      placeholder='e.g., serving, portion'
                    />
                  </div>
                )}
              </div>
            </Modal>
          </div>
        </div>

        <div>
          <label className='text-foreground mb-2 block text-sm font-medium'>
            Instructions *
          </label>
          <DynamicList
            items={instructions}
            onItemsChange={setInstructions}
            allowAdd
            allowDelete
            allowReorder
            addPlaceholder='Add instruction step...'
            marker='decimal'
            showReorderButtons
          />
        </div>

        <div className='border-border flex gap-3 border-t pt-4'>
          <Button type='submit' variant='primary' className='flex-1'>
            {isEditing ? 'Update Meal' : 'Create Meal'}
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={handleCancel}
            className='flex-1'
          >
            Cancel
          </Button>
          {isEditing && (
            <Button type='button' variant='destructive' onClick={handleDelete}>
              Delete Meal
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MealDetail;
