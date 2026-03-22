import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Input,
  Textarea,
  Select,
  Button,
  DynamicList,
  Label,
  Badge,
} from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { Recipe, RecipeCategory, RecipeIngredient, RECIPE_CATEGORY_COLORS, RECIPE_CATEGORY_EMOJIS } from '@lib/recipes';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import {
  createRecipe as createRecipeAsync,
  updateRecipe as updateRecipeAsync,
  deleteRecipe as deleteRecipeAsync,
} from '@store/actions/recipeActions';
import { shareRecipe, unshareRecipe } from '@store/actions/shareRecipeActions';
import { createShoppingListItem } from '@store/actions/shoppingListActions';
import type { DynamicListItem } from '@moondreamsdev/dreamer-ui/components';
import { RecipeIngredientSelector } from '@components/recipes/RecipeIngredientSelector';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const recipes = useAppSelector((state) => state.recipes.items);
  const allIngredients = useAppSelector((state) => state.ingredients.items);
  const { confirm } = useActionModal();
  const { addToast } = useToast();

  const isEditing = id !== 'new';
  const existingRecipe = isEditing ? recipes.find((m) => m.id === id) : undefined;

  const [isViewMode, setIsViewMode] = useState(isEditing);
  const [pendingShoppingListIngredients, setPendingShoppingListIngredients] =
    useState<RecipeIngredient[] | null>(null);
  const [shoppingListPhase, setShoppingListPhase] = useState<'prompt' | 'adding' | 'done' | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  const fromRecipePath =
    isEditing && existingRecipe ? `/recipes/${existingRecipe.id}` : '/recipes/new';

  const [title, setTitle] = useState(existingRecipe?.title || '');
  const [description, setDescription] = useState(
    existingRecipe?.description || '',
  );
  const [category, setCategory] = useState<string>(
    existingRecipe?.category ?? 'breakfast',
  );
  const [prepTime, setPrepTime] = useState(
    existingRecipe?.prepTime.toString() ?? '0',
  );
  const [cookTime, setCookTime] = useState(
    existingRecipe?.cookTime.toString() ?? '0',
  );
  const [servingSize, setServingSize] = useState(
    existingRecipe?.servingSize.toString() ?? '1',
  );
  const [imageUrl, setImageUrl] = useState<string>(
    existingRecipe?.imageUrl || '',
  );
  const [instructions, setInstructions] = useState<DynamicListItem<object>[]>(
    existingRecipe?.instructions.map((inst, index) => ({
      id: `inst-${index}`,
      content: inst,
    })) ?? [],
  );
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>(
    existingRecipe?.ingredients ?? [],
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
        setSelectedIngredients((prev) => {
          if (prev.some((item) => item.ingredientId === newId)) {
            return prev;
          }
          const result = [...prev, { ingredientId: newId, servings: 1 }];
          return result;
        });
      }
    }
  }, [location.state, allIngredients]);

  const categoryOptions = Object.entries(RECIPE_CATEGORY_EMOJIS).map(
    ([cat, emoji]) => ({
      value: cat,
      text: `${emoji} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
    }),
  );

  const formatSharedAt = (ts: number) => {
    const d = new Date(ts);
    const result = d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    return result;
  };

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

  const handleShare = async () => {
    if (!existingRecipe) return;
    setShareLoading(true);
    try {
      const result = await dispatch(shareRecipe(existingRecipe)).unwrap();
      const shareUrl = `${window.location.origin}/shared/${result.share!.id}`;
      navigator.clipboard.writeText(shareUrl).catch((err) => {
        console.error('Failed to copy share link:', err);
      });
      addToast({
        title: 'Recipe shared — link copied',
        description: 'Anyone with this link can view the recipe as it is right now.',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to share recipe:', err);
      addToast({
        title: 'Failed to share recipe',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleUnshare = async () => {
    if (!existingRecipe) return;

    const confirmed = await confirm({
      title: 'Stop Sharing',
      message: 'Are you sure you want to stop sharing this recipe? The share link will no longer work.',
      confirmText: 'Stop Sharing',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!confirmed) return;

    setShareLoading(true);
    try {
      await dispatch(unshareRecipe(existingRecipe)).unwrap();
      addToast({
        title: 'Sharing stopped',
        description: 'This recipe is no longer shared.',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to unshare recipe:', err);
      addToast({
        title: 'Failed to stop sharing',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!existingRecipe?.share) return;
    const shareUrl = `${window.location.origin}/shared/${existingRecipe.share.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      addToast({
        title: 'Link copied',
        description: 'Share link copied to clipboard.',
        type: 'success',
      });
    });
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const instructionsList = instructions
      .map((item) => (typeof item.content === 'string' ? item.content : ''))
      .filter((line) => line.trim().length > 0);

    const ingredientsList: RecipeIngredient[] = selectedIngredients
      .filter((item) => item.ingredientId.trim().length > 0)
      .map((item) => ({
        ingredientId: item.ingredientId,
        servings: item.servings > 0 ? item.servings : 1,
      }));

    const recipeData: Omit<Recipe, 'id' | 'userId'> = {
      title,
      description,
      category: category as RecipeCategory,
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      servingSize: Number(servingSize) || 1,
      imageUrl: imageUrl,
      instructions: instructionsList,
      ingredients: ingredientsList,
      share: existingRecipe?.share ?? null,
    };

    try {
      if (isEditing && existingRecipe) {
        const updatedRecipe: Recipe = { ...existingRecipe, ...recipeData };
        await dispatch(updateRecipeAsync(updatedRecipe)).unwrap();
        navigate('/recipes');
      } else {
        await dispatch(createRecipeAsync(recipeData)).unwrap();
        if (ingredientsList.length > 0) {
          setPendingShoppingListIngredients(ingredientsList);
          setShoppingListPhase('prompt');
        } else {
          navigate('/recipes');
        }
      }
    } catch (err) {
      console.error(isEditing ? 'Failed to update recipe:' : 'Failed to create recipe:', err);
      addToast({
        title: isEditing ? 'Failed to update recipe' : 'Failed to create recipe',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const handleAddIngredientsToShoppingList = async () => {
    if (!pendingShoppingListIngredients) return;
    setShoppingListPhase('adding');

    let itemsAdded = 0;
    for (const recipeIngredient of pendingShoppingListIngredients) {
      const ingredient = allIngredients.find((i) => i.id === recipeIngredient.ingredientId);
      if (!ingredient) continue;

      try {
        await dispatch(
          createShoppingListItem({
            name: ingredient.name,
            ingredientId: ingredient.id,
            productId: null,
            amount: recipeIngredient.servings,
            unit: ingredient.unit,
            category: ingredient.type,
            note: `For ${title}`,
            checked: false,
          }),
        ).unwrap();
        itemsAdded++;
      } catch {
        // Continue adding remaining items even if one fails
      }
    }

    if (itemsAdded > 0) {
      addToast({
        title: 'Added to shopping list',
        description: `${itemsAdded} ingredient${itemsAdded === 1 ? '' : 's'} added.`,
        type: 'success',
      });
    }

    setShoppingListPhase('done');
    navigate('/recipes');
  };

  const handleSkipShoppingList = () => {
    setShoppingListPhase('done');
    navigate('/recipes');
  };

  const handleDelete = async () => {
    if (!existingRecipe) return;

    const confirmed = await confirm({
      title: 'Delete Recipe',
      message: `Are you sure you want to delete "${existingRecipe.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!confirmed) return;

    try {
      await dispatch(deleteRecipeAsync(existingRecipe.id)).unwrap();
      navigate('/recipes');
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      addToast({
        title: 'Failed to delete recipe',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setIsViewMode(true);
    } else {
      navigate('/recipes');
    }
  };

  if (isViewMode && isEditing && existingRecipe) {
    return (
      <div className='mx-auto mt-10 max-w-4xl p-6 md:mt-0'>
        <div className='mb-8'>
          <Link
            to='/recipes'
            className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
          >
            ← Back to Recipes
          </Link>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-foreground mb-2 text-4xl font-bold'>
                {existingRecipe.title}
              </h1>
              <Badge
                variant='base'
                className={join(
                  'capitalize',
                  RECIPE_CATEGORY_COLORS[existingRecipe.category],
                )}
              >
                {RECIPE_CATEGORY_EMOJIS[existingRecipe.category]} {existingRecipe.category}
              </Badge>
            </div>
            <div className='hidden md:flex shrink-0 gap-2'>
              <Button
                type='button'
                variant='primary'
                onClick={() => navigate(`/recipes/${existingRecipe.id}/cook`)}
                disabled={existingRecipe.instructions.length === 0}
              >
                🍳 Cook
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setIsViewMode(false)}
              >
                Edit
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          {existingRecipe.imageUrl && (
            <img
              src={existingRecipe.imageUrl}
              alt={existingRecipe.title}
              className='border-border h-64 w-full rounded-lg border object-cover'
            />
          )}

          <p className='text-foreground'>{existingRecipe.description}</p>

          <div className='border-border grid grid-cols-3 gap-4 rounded-lg border p-4'>
            <div className='text-center'>
              <div className='text-foreground text-2xl font-bold'>
                {existingRecipe.prepTime}m
              </div>
              <div className='text-muted-foreground text-xs'>Prep Time</div>
            </div>
            <div className='text-center'>
              <div className='text-foreground text-2xl font-bold'>
                {existingRecipe.cookTime}m
              </div>
              <div className='text-muted-foreground text-xs'>Cook Time</div>
            </div>
            <div className='text-center'>
              <div className='text-foreground text-2xl font-bold'>
                {existingRecipe.servingSize}
              </div>
              <div className='text-muted-foreground text-xs'>
                {existingRecipe.servingSize === 1 ? 'Serving' : 'Servings'}
              </div>
            </div>
          </div>

          <div className='border-border rounded-lg border p-4'>
            {existingRecipe.share ? (
              <div className='flex flex-col gap-1'>
                <div className='flex flex-wrap justify-between gap-x-3 gap-y-1'>
                  <span className='text-muted-foreground text-xs'>
                    🔗 Shared on {formatSharedAt(existingRecipe.share.sharedAt)}
                  </span>
                  <div className='flex flex-wrap gap-x-3 gap-y-1'>
                  <button
                    type='button'
                    onClick={handleCopyShareLink}
                    className='text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline'
                  >
                    Copy link
                  </button>
                  <button
                    type='button'
                    onClick={handleShare}
                    disabled={shareLoading}
                    className='text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline disabled:opacity-50'
                  >
                    Refresh
                  </button>
                  <button
                    type='button'
                    onClick={handleUnshare}
                    disabled={shareLoading}
                    className='text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline disabled:opacity-50'
                  >
                    Stop sharing
                  </button>
                  </div>
                </div>
                <p className='text-muted-foreground text-xs'>
                  Refresh to update the shared link with your latest changes.
                </p>
              </div>
            ) : (
              <div className='flex items-center justify-between gap-4'>
                <p className='text-muted-foreground text-xs'>
                  Share this recipe as it is right now — generates a public link anyone can view.
                </p>
                <button
                  type='button'
                  onClick={handleShare}
                  disabled={shareLoading}
                  className='text-muted-foreground hover:text-foreground shrink-0 text-xs underline-offset-2 hover:underline disabled:opacity-50'
                >
                  🔗 Share
                </button>
              </div>
            )}
          </div>

          {existingRecipe.ingredients.length > 0 && (
            <div>
              <h2 className='text-foreground mb-3 text-xl font-semibold'>
                Ingredients
              </h2>
              <ul className='border-border divide-border divide-y rounded-lg border'>
                {existingRecipe.ingredients.map((ing) => {
                  const ingredient = allIngredients.find(
                    (i) => i.id === ing.ingredientId,
                  );
                  return (
                    <li
                      key={ing.ingredientId}
                      className='flex items-center justify-between px-4 py-2'
                    >
                      <span className='text-foreground'>
                        {ingredient?.name ?? 'Unknown Ingredient'}
                      </span>
                      <span className='text-muted-foreground text-sm'>
                        {ing.servings} {ing.servings === 1 ? 'serving' : 'servings'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {existingRecipe.instructions.length > 0 && (
            <div>
              <h2 className='text-foreground mb-3 text-xl font-semibold'>
                Instructions
              </h2>
              <ol className='space-y-2'>
                {existingRecipe.instructions.map((step, index) => (
                  <li key={index} className='flex gap-3'>
                    <span className='text-primary shrink-0 font-bold'>
                      {index + 1}.
                    </span>
                    <span className='text-foreground'>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className='bg-background border-border sticky bottom-0 flex gap-2 border-t pt-4 pb-6 md:hidden'>
          <Button
            type='button'
            variant='primary'
            onClick={() => navigate(`/recipes/${existingRecipe.id}/cook`)}
            disabled={existingRecipe.instructions.length === 0}
            className='flex-1'
          >
            🍳 Cook
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={() => setIsViewMode(false)}
            className='flex-1'
          >
            Edit
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleDelete}
            className='flex-1'
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto mt-10 max-w-4xl p-6 md:mt-0'>
      <div className='mb-8'>
        <Link
          to='/recipes'
          className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
        >
          ← Back to Recipes
        </Link>
        <h1 className='text-foreground mb-2 text-4xl font-bold'>
          {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
        </h1>
        <p className='text-muted-foreground'>
          {isEditing
            ? 'Update the details of your recipe'
            : 'Add a new recipe to your collection'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <Label htmlFor='title'>
            Title *
          </Label>
          <Input
            id='title'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter recipe title'
            required
          />
        </div>

        <div>
          <Label htmlFor='description'>
            Description *
          </Label>
          <Textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Enter recipe description'
            required
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor='category'>
            Category *
          </Label>
          <Select
            options={categoryOptions}
            value={category}
            onChange={(value) => setCategory(value)}
            placeholder='Select category'
          />
        </div>

        <div className='grid grid-cols-3 items-end gap-4'>
          <div className='flex flex-col'>
            <Label htmlFor='prepTime'>
              Prep Time (min) *
            </Label>
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
            <Label htmlFor='cookTime'>
              Cook Time (min) *
            </Label>
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
            <Label htmlFor='servingSize'>
              Servings *
            </Label>
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
          <Label htmlFor='image'>
            Recipe Image
          </Label>
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
                alt='Recipe preview'
                className='border-border h-48 w-full max-w-md rounded-lg border object-cover'
              />
            </div>
          )}
        </div>

        <div>
          <Label>
            Ingredients
          </Label>
          <RecipeIngredientSelector
            ingredients={allIngredients}
            selectedIngredients={selectedIngredients}
            onChange={setSelectedIngredients}
            fromRecipePath={fromRecipePath}
          />
        </div>

        <div>
          <Label>
            Instructions *
          </Label>
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
          {shoppingListPhase === 'prompt' ? (
            <div className='flex w-full flex-col gap-3'>
              <p className='text-foreground text-sm font-medium'>
                🛒 Would you like to add the ingredients to your shopping list?
              </p>
              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='primary'
                  className='flex-1'
                  onClick={handleAddIngredientsToShoppingList}
                >
                  Yes, add them
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  className='flex-1'
                  onClick={handleSkipShoppingList}
                >
                  No thanks
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                type='submit'
                variant='primary'
                className='flex-1'
                disabled={shoppingListPhase === 'adding'}
              >
                {isEditing ? 'Update Recipe' : 'Create Recipe'}
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={handleCancel}
                className='flex-1'
                disabled={shoppingListPhase === 'adding'}
              >
                Cancel
              </Button>
              {isEditing && (
                <Button type='button' variant='destructive' onClick={handleDelete}>
                  Delete Recipe
                </Button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default RecipeDetail;
