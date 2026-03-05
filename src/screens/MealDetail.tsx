import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input, Textarea, Select, Button, DynamicList } from '@moondreamsdev/dreamer-ui/components';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { Meal, MealCategory } from '@lib/meals';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { createMeal, updateMeal, deleteMeal } from '@store/slices/mealsSlice';
import type { DynamicListItem } from '@moondreamsdev/dreamer-ui/components';

export function MealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const meals = useAppSelector((state) => state.meals.items);
  const { confirm } = useActionModal();

  const isEditing = id !== 'new';
  const existingMeal = isEditing ? meals.find((m) => m.id === id) : undefined;

  const [title, setTitle] = useState(existingMeal?.title || '');
  const [description, setDescription] = useState(existingMeal?.description || '');
  const [category, setCategory] = useState<string>(existingMeal?.category || 'breakfast');
  const [prepTime, setPrepTime] = useState(existingMeal?.prepTime.toString() || '0');
  const [cookTime, setCookTime] = useState(existingMeal?.cookTime.toString() || '0');
  const [servingSize, setServingSize] = useState(existingMeal?.servingSize.toString() || '1');
  const [imageUrl, setImageUrl] = useState<string>(existingMeal?.imageUrl || '');
  const [instructions, setInstructions] = useState<DynamicListItem<object>[]>(
    existingMeal?.instructions.map((inst, index) => ({
      id: `inst-${index}`,
      content: inst,
    })) || []
  );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const instructionsList = instructions
      .map((item) => (typeof item.content === 'string' ? item.content : ''))
      .filter((line) => line.trim().length > 0);

    const mealData: Omit<Meal, 'id'> = {
      title,
      description,
      category: category as MealCategory,
      prepTime: parseInt(prepTime, 10) || 0,
      cookTime: parseInt(cookTime, 10) || 0,
      servingSize: parseInt(servingSize, 10) || 1,
      imageUrl: imageUrl,
      instructions: instructionsList,
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
    <div className="p-6 max-w-4xl mx-auto mt-10 md:mt-0">
      <div className="mb-8">
        <Link
          to="/meals"
          className="text-sm text-muted-foreground hover:text-foreground inline-block mb-4"
        >
          ← Back to Meals
        </Link>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {isEditing ? 'Edit Meal' : 'Create New Meal'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Update the details of your meal recipe' : 'Add a new meal to your collection'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
            Title *
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter meal title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
            Description *
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter meal description"
            required
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
            Category *
          </label>
          <Select
            options={categoryOptions}
            value={category}
            onChange={(value) => setCategory(value)}
            placeholder="Select category"
          />
        </div>

        <div className="grid grid-cols-3 items-end gap-4">
          <div className="flex flex-col">
            <label htmlFor="prepTime" className="block text-sm font-medium text-foreground mb-1 min-h-10 sm:min-h-0">
              Prep Time (min) *
            </label>
            <Input
              id="prepTime"
              type="number"
              min="0"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="cookTime" className="block text-sm font-medium text-foreground mb-1 min-h-10 sm:min-h-0">
              Cook Time (min) *
            </label>
            <Input
              id="cookTime"
              type="number"
              min="0"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="servingSize" className="block text-sm font-medium text-foreground mb-1 min-h-10 sm:min-h-0">
              Servings *
            </label>
            <Input
              id="servingSize"
              type="number"
              min="1"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-foreground mb-1">
            Meal Image
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
          />
          {imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Image Preview:</p>
              <img
                src={imageUrl}
                alt="Meal preview"
                className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Instructions *
          </label>
          <DynamicList
            items={instructions}
            onItemsChange={setInstructions}
            allowAdd
            allowDelete
            allowReorder
            addPlaceholder="Add instruction step..."
            marker="decimal"
            showReorderButtons
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button type="submit" variant="primary" className="flex-1">
            {isEditing ? 'Update Meal' : 'Create Meal'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          {isEditing && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Meal
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MealDetail;
