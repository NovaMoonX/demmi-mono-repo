import { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Input,
  Select,
  Button,
  Badge,
  Label,
} from '@moondreamsdev/dreamer-ui/components';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import {
  Ingredient,
  IngredientType,
  MeasurementUnit,
  Product,
  INGREDIENT_TYPE_EMOJIS,
  INGREDIENT_TYPE_COLORS,
  MEASUREMENT_UNIT_OPTIONS,
  MEASUREMENT_UNIT_LABELS,
} from '@lib/ingredients';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import {
  createIngredient as createIngredientAsync,
  updateIngredient as updateIngredientAsync,
  deleteIngredient as deleteIngredientAsync,
} from '@store/actions/ingredientActions';
import { capitalize, generatedId } from '@/utils';
import { join } from '@moondreamsdev/dreamer-ui/utils';

export function IngredientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector((state) => state.ingredients.items);
  const { confirm } = useActionModal();
  const { addToast } = useToast();

  const isEditing = id !== 'new';
  const existingIngredient = isEditing
    ? ingredients.find((i) => i.id === id)
    : undefined;

  const [isViewMode, setIsViewMode] = useState(isEditing);

  // Navigation state set by MealDetail when the user comes here to create an ingredient for a meal
  const fromMealPath =
    (location.state as { fromMealPath?: string } | null)?.fromMealPath ?? null;

  const fromBarcodeEntry =
    (location.state as { fromBarcodeEntry?: boolean } | null)?.fromBarcodeEntry ?? false;

  const backLinkTo =
    fromMealPath ?? (fromBarcodeEntry ? '/ingredients/new/barcode-entry' : '/ingredients');
  const backLinkState =
    fromBarcodeEntry && fromMealPath ? { fromMealPath } : undefined;
  const backLinkText =
    fromMealPath
      ? '← Back to Meal'
      : fromBarcodeEntry
        ? '← Back to Barcode Entry'
        : '← Back to Ingredients';

  // Pre-fill data passed from IngredientBarcodeEntry
  const barcodePrefill = (location.state as {
    barcodePrefill?: {
      barcode?: string | null;
      name?: string;
      imageUrl?: string;
      servingSize?: number;
      unit?: MeasurementUnit;
      otherUnit?: string | null;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
      calories?: number;
    };
  } | null)?.barcodePrefill ?? null;

  const [name, setName] = useState(existingIngredient?.name ?? barcodePrefill?.name ?? '');
  const [type, setType] = useState<IngredientType>(
    existingIngredient?.type ?? 'other',
  );
  const [currentAmount, setCurrentAmount] = useState(
    existingIngredient?.currentAmount.toString() ?? '0',
  );
  const [servingSize, setServingSize] = useState(
    existingIngredient?.servingSize.toString() ?? barcodePrefill?.servingSize?.toString() ?? '0',
  );
  const [unit, setUnit] = useState<MeasurementUnit>(
    existingIngredient?.unit ?? barcodePrefill?.unit ?? 'g',
  );
  const [otherUnit, setOtherUnit] = useState<string>(
    existingIngredient?.otherUnit ?? barcodePrefill?.otherUnit ?? '',
  );
  const [imageUrl, setImageUrl] = useState<string>(
    existingIngredient?.imageUrl ?? barcodePrefill?.imageUrl ?? '',
  );
  const [barcode, setBarcode] = useState<string>(
    existingIngredient?.barcode ?? barcodePrefill?.barcode ?? '',
  );

  // Nutrient profile state
  const [protein, setProtein] = useState(
    existingIngredient?.nutrients.protein.toString() ?? barcodePrefill?.protein?.toString() ?? '0',
  );
  const [carbs, setCarbs] = useState(
    existingIngredient?.nutrients.carbs.toString() ?? barcodePrefill?.carbs?.toString() ?? '0',
  );
  const [fat, setFat] = useState(
    existingIngredient?.nutrients.fat.toString() ?? barcodePrefill?.fat?.toString() ?? '0',
  );
  const [fiber, setFiber] = useState(
    existingIngredient?.nutrients.fiber.toString() ?? barcodePrefill?.fiber?.toString() ?? '0',
  );
  const [sugar, setSugar] = useState(
    existingIngredient?.nutrients.sugar.toString() ?? barcodePrefill?.sugar?.toString() ?? '0',
  );
  const [sodium, setSodium] = useState(
    existingIngredient?.nutrients.sodium.toString() ?? barcodePrefill?.sodium?.toString() ?? '0',
  );
  const [calories, setCalories] = useState(
    existingIngredient?.nutrients.calories.toString() ?? barcodePrefill?.calories?.toString() ?? '0',
  );

  // Products state
  const [products, setProducts] = useState<Product[]>(
    existingIngredient?.products ?? [],
  );
  const [defaultProductId, setDefaultProductId] = useState<string | null>(
    existingIngredient?.defaultProductId ?? null,
  );
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productRetailer, setProductRetailer] = useState('');
  const [productLabel, setProductLabel] = useState('');
  const [productCost, setProductCost] = useState('');
  const [productServings, setProductServings] = useState('');
  const [productUrl, setProductUrl] = useState('');

  const typeOptions = Object.entries(INGREDIENT_TYPE_EMOJIS).map(
    ([typeKey, emoji]) => ({
      value: typeKey,
      text: `${emoji} ${capitalize(typeKey)}`,
    }),
  );

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

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductRetailer('');
    setProductLabel('');
    setProductCost('');
    setProductServings('');
    setProductUrl('');
    setShowProductForm(false);
  };

  const handleAddProduct = () => {
    if (!productRetailer || !productLabel || !productCost || !productServings)
      return;

    const newProduct: Product = {
      id: generatedId('prod'),
      retailer: productRetailer,
      label: productLabel,
      cost: Number(productCost),
      servings: Number(productServings),
      url: productUrl || null,
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    resetProductForm();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductRetailer(product.retailer);
    setProductLabel(product.label);
    setProductCost(product.cost.toString());
    setProductServings(product.servings.toString());
    setProductUrl(product.url || '');
    setShowProductForm(true);
  };

  const handleUpdateProduct = () => {
    if (
      !editingProductId ||
      !productRetailer ||
      !productLabel ||
      !productCost ||
      !productServings
    )
      return;

    const updatedProducts = products.map((p) => {
      if (p.id === editingProductId) {
        const result: Product = {
          id: p.id,
          retailer: productRetailer,
          label: productLabel,
          cost: Number(productCost),
          servings: Number(productServings),
          url: productUrl || null,
        };
        return result;
      }
      return p;
    });

    setProducts(updatedProducts);
    resetProductForm();
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const confirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.label}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (confirmed) {
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);
      if (editingProductId === productId) {
        resetProductForm();
      }
      if (defaultProductId === productId) {
        setDefaultProductId(null);
      }
    }
  };

  const handleSetDefaultProduct = (productId: string) => {
    const newDefaultId = defaultProductId === productId ? null : productId;
    setDefaultProductId(newDefaultId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ingredientData: Omit<Ingredient, 'id' | 'userId'> = {
      name,
      type: type as IngredientType,
      currentAmount: Number(currentAmount) || 0,
      servingSize: Number(servingSize) || 100,
      unit: unit as MeasurementUnit,
      otherUnit: unit === 'other' ? otherUnit : null,
      products: products,
      defaultProductId: defaultProductId,
      imageUrl: imageUrl,
      barcode: barcode.trim() || null,
      nutrients: {
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0,
        sugar: Number(sugar) || 0,
        sodium: Number(sodium) || 0,
        calories: Number(calories) || 0,
      },
    };

    try {
      if (isEditing && existingIngredient) {
        const updatedIngredient: Ingredient = { ...ingredientData, id: existingIngredient.id, userId: existingIngredient.userId };
        await dispatch(updateIngredientAsync(updatedIngredient)).unwrap();
        navigate(fromMealPath ?? '/ingredients');
      } else {
        const newIngredient = await dispatch(createIngredientAsync(ingredientData)).unwrap();
        if (fromMealPath) {
          navigate(fromMealPath, { state: { newIngredientId: newIngredient.id } });
        } else {
          navigate('/ingredients');
        }
      }
    } catch (err) {
      console.error(isEditing ? 'Failed to update ingredient:' : 'Failed to create ingredient:', err);
      addToast({
        title: isEditing ? 'Failed to update ingredient' : 'Failed to create ingredient',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!existingIngredient) return;

    const confirmed = await confirm({
      title: 'Delete Ingredient',
      message: `Are you sure you want to delete "${existingIngredient.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!confirmed) return;

    try {
      await dispatch(deleteIngredientAsync(existingIngredient.id)).unwrap();
      navigate('/ingredients');
    } catch (err) {
      console.error('Failed to delete ingredient:', err);
      addToast({
        title: 'Failed to delete ingredient',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setIsViewMode(true);
    } else {
      navigate(fromMealPath ?? '/ingredients');
    }
  };

  if (isViewMode && isEditing && existingIngredient) {
    const unitLabel =
      existingIngredient.unit === 'other'
        ? (existingIngredient.otherUnit ?? existingIngredient.unit)
        : MEASUREMENT_UNIT_LABELS[existingIngredient.unit];

    return (
      <div className='mx-auto mt-10 max-w-4xl p-6 md:mt-0'>
        <div className='mb-8'>
          <Link
            to={backLinkTo}
            state={backLinkState}
            className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
          >
            {backLinkText}
          </Link>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-foreground mb-2 text-4xl font-bold'>
                {existingIngredient.name}
              </h1>
              <Badge
                variant='base'
                className={join(
                  'capitalize',
                  INGREDIENT_TYPE_COLORS[existingIngredient.type],
                )}
              >
                {INGREDIENT_TYPE_EMOJIS[existingIngredient.type]}{' '}
                {capitalize(existingIngredient.type)}
              </Badge>
            </div>
            <div className='flex shrink-0 gap-2'>
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
          {existingIngredient.imageUrl && (
            <img
              src={existingIngredient.imageUrl}
              alt={existingIngredient.name}
              className='border-border h-64 w-full rounded-lg border object-cover'
            />
          )}

          <div className='border-border grid grid-cols-3 gap-4 rounded-lg border p-4'>
            <div className='text-center'>
              <div className='text-foreground text-2xl font-bold'>
                {existingIngredient.currentAmount}
              </div>
              <div className='text-muted-foreground text-xs'>Current Amount</div>
            </div>
            <div className='text-center'>
              <div className='text-foreground text-2xl font-bold'>
                {existingIngredient.servingSize}
              </div>
              <div className='text-muted-foreground text-xs'>Serving Size</div>
            </div>
            <div className='text-center'>
              <div className='text-foreground text-2xl font-bold'>
                {unitLabel}
              </div>
              <div className='text-muted-foreground text-xs'>Unit</div>
            </div>
          </div>

          <div>
            <h2 className='text-foreground mb-3 text-xl font-semibold'>
              Nutrition (per serving)
            </h2>
            <div className='border-border grid grid-cols-2 gap-3 rounded-lg border p-4 sm:grid-cols-4'>
              {[
                { label: 'Protein', value: existingIngredient.nutrients.protein, unit: 'g' },
                { label: 'Carbs', value: existingIngredient.nutrients.carbs, unit: 'g' },
                { label: 'Fat', value: existingIngredient.nutrients.fat, unit: 'g' },
                { label: 'Fiber', value: existingIngredient.nutrients.fiber, unit: 'g' },
                { label: 'Sugar', value: existingIngredient.nutrients.sugar, unit: 'g' },
                { label: 'Sodium', value: existingIngredient.nutrients.sodium, unit: 'mg' },
                { label: 'Calories', value: existingIngredient.nutrients.calories, unit: 'kcal' },
              ].map(({ label, value, unit: nutrUnit }) => (
                <div key={label} className='text-center'>
                  <div className='text-foreground font-bold'>
                    {value}
                    <span className='text-muted-foreground ml-1 text-xs font-normal'>
                      {nutrUnit}
                    </span>
                  </div>
                  <div className='text-muted-foreground text-xs'>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {existingIngredient.products.length > 0 && (
            <div>
              <h2 className='text-foreground mb-3 text-xl font-semibold'>
                Products
              </h2>
              <ul className='space-y-3'>
                {existingIngredient.products.map((product) => {
                  const pricePerServing = product.cost / product.servings;
                  return (
                    <li
                      key={product.id}
                      className='border-border rounded-lg border p-4'
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div>
                          {existingIngredient.defaultProductId === product.id && (
                            <Badge variant='primary' className='mb-1'>
                              Default
                            </Badge>
                          )}
                          <div className='text-foreground font-medium'>
                            {product.label}
                          </div>
                          <div className='text-muted-foreground text-sm'>
                            {product.retailer}
                          </div>
                          <div className='mt-1 flex gap-4 text-sm'>
                            <span className='text-foreground'>
                              ${product.cost.toFixed(2)} ({product.servings} servings)
                            </span>
                            <span className='text-muted-foreground'>
                              ${pricePerServing.toFixed(2)}/serving
                            </span>
                          </div>
                          {product.url && (
                            <a
                              href={product.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-primary mt-1 inline-block text-sm hover:underline'
                            >
                              View Product →
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {existingIngredient.barcode && (
            <div className='border-border rounded-lg border p-4'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <p className='text-muted-foreground text-xs uppercase tracking-wide'>
                    Barcode
                  </p>
                  <p className='text-foreground font-mono font-medium'>
                    {existingIngredient.barcode}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(existingIngredient.barcode)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Button type='button' variant='secondary'>
                    🔍 Search Live Price
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto mt-10 max-w-4xl p-6 md:mt-0'>
      <div className='mb-8'>
        <Link
          to={backLinkTo}
          state={backLinkState}
          className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
        >
          {backLinkText}
        </Link>
        <h1 className='text-foreground mb-2 text-4xl font-bold'>
          {isEditing ? 'Edit Ingredient' : 'Create New Ingredient'}
        </h1>
        <p className='text-muted-foreground'>
          {isEditing
            ? 'Update the details of your ingredient'
            : fromMealPath
              ? 'Add a new ingredient to use in your meal'
              : 'Add a new ingredient to your inventory'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <Label htmlFor='name'>
            Name *
          </Label>
          <Input
            id='name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Enter ingredient name'
            required
          />
        </div>

        <div>
          <Label htmlFor='type'>
            Type *
          </Label>
          <Select
            options={typeOptions}
            value={type}
            onChange={(value) => setType(value as IngredientType)}
            placeholder='Select type'
          />
        </div>

        <div className='grid grid-cols-2 items-end gap-4'>
          <div className='flex flex-col'>
            <Label htmlFor='currentAmount'>
              Current Amount *
            </Label>
            <Input
              id='currentAmount'
              type='number'
              step='0.01'
              min='0'
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              required
            />
          </div>

          <div className='flex flex-col'>
            <Label htmlFor='servingSize'>
              Serving Size *
            </Label>
            <Input
              id='servingSize'
              type='number'
              step='0.01'
              min='0.01'
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              required
            />
          </div>
        </div>

        <div className='grid grid-cols-2 items-end gap-4'>
          <div className='flex flex-col'>
            <Label htmlFor='unit'>
              Unit *
            </Label>
            <Select
              options={MEASUREMENT_UNIT_OPTIONS}
              value={unit}
              onChange={(value) => setUnit(value as MeasurementUnit)}
              placeholder='Select unit'
            />
          </div>

          {unit === 'other' && (
            <div className='flex flex-col'>
              <Label
                htmlFor='otherUnit'
                className='text-foreground mb-1 block text-sm font-medium'
                description='Enter unit in its singular form (e.g "serving" instead of "servings")'
              >
                Custom Unit *
              </Label>
              <Input
                id='otherUnit'
                type='text'
                value={otherUnit}
                onChange={(e) => setOtherUnit(e.target.value)}
                placeholder='e.g., serving, portion'
                required
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor='image'>
            Ingredient Image
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
                alt='Ingredient preview'
                className='border-border h-48 w-full max-w-md rounded-lg border object-cover'
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor='barcode'>
            Barcode
          </Label>
          <Input
            id='barcode'
            type='text'
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder='e.g. 4 012345 678905'
          />
        </div>

        <div className='border-border border-t pt-6'>
          <h2 className='text-foreground mb-4 text-xl font-semibold'>
            Nutrient Profile (per serving)
          </h2>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col'>
              <Label htmlFor='protein'>
                Protein (g) *
              </Label>
              <Input
                id='protein'
                type='number'
                step='0.1'
                min='0'
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
              />
            </div>

            <div className='flex flex-col'>
              <Label htmlFor='carbs'>
                Carbohydrates (g) *
              </Label>
              <Input
                id='carbs'
                type='number'
                step='0.1'
                min='0'
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                required
              />
            </div>

            <div className='flex flex-col'>
              <Label htmlFor='fat'>
                Fat (g) *
              </Label>
              <Input
                id='fat'
                type='number'
                step='0.1'
                min='0'
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                required
              />
            </div>

            <div className='flex flex-col'>
              <Label htmlFor='fiber'>
                Fiber (g) *
              </Label>
              <Input
                id='fiber'
                type='number'
                step='0.1'
                min='0'
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                required
              />
            </div>

            <div className='flex flex-col'>
              <Label htmlFor='sugar'>
                Sugar (g) *
              </Label>
              <Input
                id='sugar'
                type='number'
                step='0.1'
                min='0'
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                required
              />
            </div>

            <div className='flex flex-col'>
              <Label htmlFor='sodium'>
                Sodium (mg) *
              </Label>
              <Input
                id='sodium'
                type='number'
                step='0.1'
                min='0'
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
                required
              />
            </div>

            <div className='col-span-2 flex flex-col'>
              <Label htmlFor='calories'>
                Calories (kcal) *
              </Label>
              <Input
                id='calories'
                type='number'
                step='0.1'
                min='0'
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className='border-border border-t pt-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-foreground text-xl font-semibold'>
              Product Pricing
            </h2>
          </div>

          <div className='space-y-4'>
            {products.length > 0 && (
              <div className='space-y-2'>
                {products.map((product) => {
                  const pricePerServing = product.cost / product.servings;

                  return (
                    <div
                      key={product.id}
                      className={join(
                        'rounded-lg border p-4',
                        editingProductId === product.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card',
                      )}
                    >
                      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                        <div className='flex-1'>
                          <div className='flex flex-col items-start justify-center gap-2'>
                            {defaultProductId === product.id && (
                              <Badge variant='primary'>Default</Badge>
                            )}
                            <h3 className='text-foreground font-medium'>
                              {product.label}
                            </h3>
                          </div>
                          <p className='text-muted-foreground text-sm'>
                            {product.retailer}
                          </p>
                          <div className='mt-2 flex gap-4 text-sm'>
                            <span className='text-foreground'>
                              ${product.cost.toFixed(2)} ({product.servings}{' '}
                              servings)
                            </span>
                            <span className='text-muted-foreground'>
                              ${pricePerServing.toFixed(2)}/serving
                            </span>
                          </div>
                          {product.url && (
                            <a
                              href={product.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-primary mt-1 inline-block text-sm hover:underline'
                            >
                              View Product →
                            </a>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            type='button'
                            variant={
                              defaultProductId === product.id
                                ? 'primary'
                                : 'secondary'
                            }
                            onClick={() => handleSetDefaultProduct(product.id)}
                            className='flex-1 py-1 text-xs md:py-2 md:text-sm lg:flex-none'
                          >
                            {defaultProductId === product.id
                              ? 'Unset Default'
                              : 'Set Default'}
                          </Button>
                          <Button
                            type='button'
                            variant='secondary'
                            onClick={() => handleEditProduct(product)}
                            className='flex-1 py-1 text-xs md:py-2 md:text-sm lg:flex-none'
                          >
                            Edit
                          </Button>
                          <Button
                            type='button'
                            variant='destructive'
                            onClick={() => handleDeleteProduct(product.id)}
                            className='flex-1 py-1 text-xs md:py-2 md:text-sm lg:flex-none'
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!showProductForm && (
              <Button
                type='button'
                variant='secondary'
                onClick={() => setShowProductForm(true)}
                className='w-full'
              >
                + Add Product
              </Button>
            )}

            {showProductForm && (
              <div className='border-border bg-muted/50 rounded-lg border p-4'>
                <h3 className='text-foreground mb-3 text-sm font-medium'>
                  {editingProductId ? 'Edit Product' : 'Add New Product'}
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex flex-col'>
                    <Label>
                      Retailer
                    </Label>
                    <Input
                      type='text'
                      value={productRetailer}
                      onChange={(e) => setProductRetailer(e.target.value)}
                      placeholder='e.g., Whole Foods'
                    />
                  </div>

                  <div className='flex flex-col'>
                    <Label>
                      Product Label
                    </Label>
                    <Input
                      type='text'
                      value={productLabel}
                      onChange={(e) => setProductLabel(e.target.value)}
                      placeholder='e.g., Organic Chicken Breast'
                    />
                  </div>

                  <div className='flex flex-col'>
                    <Label>
                      Cost ($)
                    </Label>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      value={productCost}
                      onChange={(e) => setProductCost(e.target.value)}
                      placeholder='0.00'
                    />
                  </div>

                  <div className='flex flex-col'>
                    <Label>
                      Servings
                    </Label>
                    <Input
                      type='number'
                      step='0.01'
                      min='0.01'
                      value={productServings}
                      onChange={(e) => setProductServings(e.target.value)}
                      placeholder='0'
                    />
                  </div>

                  <div className='col-span-2 flex flex-col'>
                    <Label>
                      Product URL (optional)
                    </Label>
                    <Input
                      type='url'
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      placeholder='https://example.com/product'
                    />
                  </div>

                  <div className='col-span-2 flex gap-2'>
                    {editingProductId ? (
                      <>
                        <Button
                          type='button'
                          variant='primary'
                          onClick={handleUpdateProduct}
                          className='flex-1'
                        >
                          Update Product
                        </Button>
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={resetProductForm}
                          className='flex-1'
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={resetProductForm}
                          className='flex-1'
                        >
                          Cancel
                        </Button>
                        <Button
                          type='button'
                          variant='primary'
                          onClick={handleAddProduct}
                          className='flex-1'
                        >
                          Add Product
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        )}

        <div className='border-border flex gap-3 border-t pt-4'>
          <Button type='submit' variant='primary' className='flex-1'>
            {isEditing ? 'Update Ingredient' : 'Create Ingredient'}
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
              Delete Ingredient
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default IngredientDetail;
