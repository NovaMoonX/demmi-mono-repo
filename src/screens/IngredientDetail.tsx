import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Input,
  Select,
  Button,
  Badge,
} from '@moondreamsdev/dreamer-ui/components';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import {
  Ingredient,
  IngredientType,
  MeasurementUnit,
  Product,
  INGREDIENT_TYPE_EMOJIS,
  MEASUREMENT_UNIT_LABELS,
} from '@lib/ingredients';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import {
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '@store/slices/ingredientsSlice';
import { capitalize } from '@/utils';
import { join } from '@moondreamsdev/dreamer-ui/utils';

export function IngredientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector((state) => state.ingredients.items);
  const { confirm } = useActionModal();

  const isEditing = id !== 'new';
  const existingIngredient = isEditing
    ? ingredients.find((i) => i.id === id)
    : undefined;

  const [name, setName] = useState(existingIngredient?.name || '');
  const [type, setType] = useState<IngredientType>(
    existingIngredient?.type || 'other',
  );
  const [currentAmount, setCurrentAmount] = useState(
    existingIngredient?.currentAmount.toString() || '0',
  );
  const [servingSize, setServingSize] = useState(
    existingIngredient?.servingSize.toString() || '0',
  );
  const [unit, setUnit] = useState<MeasurementUnit>(
    existingIngredient?.unit || 'g',
  );
  const [otherUnit, setOtherUnit] = useState<string>(
    existingIngredient?.otherUnit || '',
  );
  const [imageUrl, setImageUrl] = useState<string>(
    existingIngredient?.imageUrl || '',
  );

  // Nutrient profile state
  const [protein, setProtein] = useState(
    existingIngredient?.nutrients.protein.toString() || '0',
  );
  const [carbs, setCarbs] = useState(
    existingIngredient?.nutrients.carbs.toString() || '0',
  );
  const [fat, setFat] = useState(
    existingIngredient?.nutrients.fat.toString() || '0',
  );
  const [fiber, setFiber] = useState(
    existingIngredient?.nutrients.fiber.toString() || '0',
  );
  const [sugar, setSugar] = useState(
    existingIngredient?.nutrients.sugar.toString() || '0',
  );
  const [sodium, setSodium] = useState(
    existingIngredient?.nutrients.sodium.toString() || '0',
  );
  const [calories, setCalories] = useState(
    existingIngredient?.nutrients.calories.toString() || '0',
  );

  // Products state
  const [products, setProducts] = useState<Product[]>(
    existingIngredient?.products || [],
  );
  const [defaultProductId, setDefaultProductId] = useState<string | null>(
    existingIngredient?.defaultProductId || null,
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

  const unitOptions = Object.entries(MEASUREMENT_UNIT_LABELS).map(
    ([unitKey, label]) => ({
      value: unitKey,
      text: label,
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
      id: `prod-${Date.now()}`,
      retailer: productRetailer,
      label: productLabel,
      cost: parseFloat(productCost),
      servings: parseFloat(productServings),
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
          cost: parseFloat(productCost),
          servings: parseFloat(productServings),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ingredientData: Omit<Ingredient, 'id'> = {
      name,
      type: type as IngredientType,
      currentAmount: parseFloat(currentAmount) || 0,
      servingSize: parseFloat(servingSize) || 100,
      unit: unit as MeasurementUnit,
      otherUnit: unit === 'other' ? otherUnit : null,
      products: products,
      defaultProductId: defaultProductId,
      imageUrl: imageUrl,
      nutrients: {
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: parseFloat(fiber) || 0,
        sugar: parseFloat(sugar) || 0,
        sodium: parseFloat(sodium) || 0,
        calories: parseFloat(calories) || 0,
      },
    };

    if (isEditing && existingIngredient) {
      dispatch(updateIngredient({ id: existingIngredient.id, updates: ingredientData }));
    } else {
      dispatch(createIngredient(ingredientData));
    }

    navigate('/ingredients');
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

    if (confirmed) {
      dispatch(deleteIngredient(existingIngredient.id));
      navigate('/ingredients');
    }
  };

  const handleCancel = () => {
    navigate('/ingredients');
  };

  return (
    <div className='mx-auto mt-10 max-w-4xl p-6 md:mt-0'>
      <div className='mb-8'>
        <Link
          to='/ingredients'
          className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
        >
          ← Back to Ingredients
        </Link>
        <h1 className='text-foreground mb-2 text-4xl font-bold'>
          {isEditing ? 'Edit Ingredient' : 'Create New Ingredient'}
        </h1>
        <p className='text-muted-foreground'>
          {isEditing
            ? 'Update the details of your ingredient'
            : 'Add a new ingredient to your inventory'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label
            htmlFor='name'
            className='text-foreground mb-1 block text-sm font-medium'
          >
            Name *
          </label>
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
          <label
            htmlFor='type'
            className='text-foreground mb-1 block text-sm font-medium'
          >
            Type *
          </label>
          <Select
            options={typeOptions}
            value={type}
            onChange={(value) => setType(value as IngredientType)}
            placeholder='Select type'
          />
        </div>

        <div className='grid grid-cols-2 items-end gap-4'>
          <div className='flex flex-col'>
            <label
              htmlFor='currentAmount'
              className='text-foreground mb-1 block text-sm font-medium'
            >
              Current Amount *
            </label>
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
            <label
              htmlFor='servingSize'
              className='text-foreground mb-1 block text-sm font-medium'
            >
              Serving Size *
            </label>
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
            <label
              htmlFor='unit'
              className='text-foreground mb-1 block text-sm font-medium'
            >
              Unit *
            </label>
            <Select
              options={unitOptions}
              value={unit}
              onChange={(value) => setUnit(value as MeasurementUnit)}
              placeholder='Select unit'
            />
          </div>

          {unit === 'other' && (
            <div className='flex flex-col'>
              <label
                htmlFor='otherUnit'
                className='text-foreground mb-1 block text-sm font-medium'
              >
                Custom Unit *
              </label>
              <Input
                id='otherUnit'
                type='text'
                value={otherUnit}
                onChange={(e) => setOtherUnit(e.target.value)}
                placeholder='e.g., servings, portions'
                required
              />
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor='image'
            className='text-foreground mb-1 block text-sm font-medium'
          >
            Ingredient Image
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
                alt='Ingredient preview'
                className='border-border h-48 w-full max-w-md rounded-lg border object-cover'
              />
            </div>
          )}
        </div>

        <div className='border-border border-t pt-6'>
          <h2 className='text-foreground mb-4 text-xl font-semibold'>
            Nutrient Profile (per serving)
          </h2>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col'>
              <label
                htmlFor='protein'
                className='text-foreground mb-1 block text-sm font-medium'
              >
                Protein (g) *
              </label>
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
              <label
                htmlFor='carbs'
                className='text-foreground mb-1 block text-sm font-medium'
              >
                Carbohydrates (g) *
              </label>
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
              <label
                htmlFor='fat'
                className='text-foreground mb-1 block text-sm font-medium'
              >
                Fat (g) *
              </label>
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
              <label
                htmlFor='fiber'
                className='text-foreground mb-1 block text-sm font-medium'
              >
                Fiber (g) *
              </label>
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
              <label
                htmlFor='sugar'
                className='text-foreground mb-1 block text-sm font-medium'
              >
                Sugar (g) *
              </label>
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
              <label
                htmlFor='sodium'
                className='text-foreground mb-1 block text-sm font-medium'
              >
                Sodium (mg) *
              </label>
              <Input
                id='sodium'
                type='number'
                step='1'
                min='0'
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
                required
              />
            </div>

            <div className='col-span-2 flex flex-col'>
              <label
                htmlFor='calories'
                className='text-foreground mb-1 block text-sm font-medium'
              >
                Calories (kcal) *
              </label>
              <Input
                id='calories'
                type='number'
                step='1'
                min='0'
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

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
                          <div className='flex flex-col justify-center items-start gap-2'>
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
                            className='flex-1 py-1 text-xs lg:flex-none md:py-2 md:text-sm'
                          >
                            {defaultProductId === product.id
                              ? 'Unset Default'
                              : 'Set Default'}
                          </Button>
                          <Button
                            type='button'
                            variant='secondary'
                            onClick={() => handleEditProduct(product)}
                            className='flex-1 py-1 text-xs lg:flex-none md:py-2 md:text-sm'
                          >
                            Edit
                          </Button>
                          <Button
                            type='button'
                            variant='destructive'
                            onClick={() => handleDeleteProduct(product.id)}
                            className='flex-1 py-1 text-xs lg:flex-none md:py-2 md:text-sm'
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
                    <label className='text-foreground mb-1 block text-sm font-medium'>
                      Retailer
                    </label>
                    <Input
                      type='text'
                      value={productRetailer}
                      onChange={(e) => setProductRetailer(e.target.value)}
                      placeholder='e.g., Whole Foods'
                    />
                  </div>

                  <div className='flex flex-col'>
                    <label className='text-foreground mb-1 block text-sm font-medium'>
                      Product Label
                    </label>
                    <Input
                      type='text'
                      value={productLabel}
                      onChange={(e) => setProductLabel(e.target.value)}
                      placeholder='e.g., Organic Chicken Breast'
                    />
                  </div>

                  <div className='flex flex-col'>
                    <label className='text-foreground mb-1 block text-sm font-medium'>
                      Cost ($)
                    </label>
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
                    <label className='text-foreground mb-1 block text-sm font-medium'>
                      Servings
                    </label>
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
                    <label className='text-foreground mb-1 block text-sm font-medium'>
                      Product URL (optional)
                    </label>
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
