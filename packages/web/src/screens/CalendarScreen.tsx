import { useState, useMemo } from 'react';
import {
  Button,
  Modal,
  Select,
  Input,
  Textarea,
  Tabs,
  TabsContent,
  Toggle,
  Label,
} from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useActionModal, useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import {
  createPlannedRecipe as createPlannedRecipeAsync,
  updatePlannedRecipe as updatePlannedRecipeAsync,
  deletePlannedRecipe as deletePlannedRecipeAsync,
} from '@store/actions/calendarActions';
import { PlannedRecipe, CalendarView, NutrientTotals } from '@lib/calendar';
import { Recipe, RECIPE_CATEGORY_OPTIONS, RecipeCategory } from '@lib/recipes';
import { Ingredient } from '@lib/ingredients';
import { TotalsCard, DayCard, DayDetailModal, MonthView } from '@components/calendar';
import { getPricePerServing } from '@/lib/ingredients/ingredients.utils';
import { formatDateFull, formatDateInput, formatDateShort, getDaysInRange, getStartOfDay, getWeekStart, parseDateInput } from '@/utils';
import { calculateTotals } from '@/lib/calendar/calendar.utils';

function calculateRecipeTotals(recipe: Recipe, ingredients: Ingredient[]): NutrientTotals {
  const totals: NutrientTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, price: 0 };
  for (const mi of recipe.ingredients) {
    const ingredient = ingredients.find((i) => i.id === mi.ingredientId);
    if (!ingredient) continue;
    totals.calories += mi.servings * ingredient.nutrients.calories;
    totals.protein += mi.servings * ingredient.nutrients.protein;
    totals.carbs += mi.servings * ingredient.nutrients.carbs;
    totals.fat += mi.servings * ingredient.nutrients.fat;
    totals.fiber += mi.servings * ingredient.nutrients.fiber;
    totals.price += mi.servings * getPricePerServing(ingredient);
  }
  return totals;
}

export function CalendarScreen() {
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(() => getStartOfDay(Date.now()));
  const [customStart, setCustomStart] = useState(() => getStartOfDay(Date.now()));
  const [customEnd, setCustomEnd] = useState(() =>
    getStartOfDay(Date.now() + 6 * 86400000)
  );

  const [showModal, setShowModal] = useState(false);
  const [editingPlannedRecipe, setEditingPlannedRecipe] = useState<PlannedRecipe | null>(null);
  const [detailDay, setDetailDay] = useState<number | null>(null);

  const [formRecipeId, setFormRecipeId] = useState('');
  const [formDate, setFormDate] = useState(() => formatDateInput(getStartOfDay(Date.now())));
  const [formCategory, setFormCategory] = useState<string>('breakfast');
  const [formNotes, setFormNotes] = useState('');
  const [showRecipeStats, setShowRecipeStats] = useState(false);

  const plannedRecipes = useAppSelector((state) => state.calendar.plannedRecipes);
  const recipes = useAppSelector((state) => state.recipes.items);
  const ingredients = useAppSelector((state) => state.ingredients.items);
  const dispatch = useAppDispatch();
  const { confirm } = useActionModal();
  const { addToast } = useToast();

  const recipeOptions = useMemo(
    () =>
      recipes.map((m) => {
        if (!showRecipeStats) return { value: m.id, text: m.title };
        const t = calculateRecipeTotals(m, ingredients);
        const description = `🔥 ${Math.round(t.calories)} kcal · 💪 ${Math.round(t.protein)}g · 🌾 ${Math.round(t.carbs)}g · 🥑 ${Math.round(t.fat)}g · 💰 $${t.price.toFixed(2)}`;
        return { value: m.id, text: m.title, description };
      }),
    [recipes, ingredients, showRecipeStats]
  );

  const dateRange = useMemo(() => {
    if (view === 'day') {
      return { start: selectedDate, end: selectedDate };
    }
    if (view === 'week') {
      const start = getWeekStart(selectedDate);
      return { start, end: start + 6 * 86400000 };
    }
    return { start: customStart, end: customEnd };
  }, [view, selectedDate, customStart, customEnd]);

  const visibleDays = useMemo(
    () => getDaysInRange(dateRange.start, dateRange.end),
    [dateRange]
  );

  const visiblePlannedRecipes = useMemo(
    () =>
      plannedRecipes.filter((pm) => {
        const pmDay = getStartOfDay(pm.date);
        return pmDay >= dateRange.start && pmDay <= dateRange.end;
      }),
    [plannedRecipes, dateRange]
  );

  const totals = useMemo(
    () => calculateTotals(visiblePlannedRecipes, recipes, ingredients),
    [visiblePlannedRecipes, recipes, ingredients]
  );

  const dateRangeLabel = useMemo(() => {
    if (view === 'day') return formatDateFull(selectedDate);
    if (view === 'week') {
      return `${formatDateShort(dateRange.start)} – ${formatDateShort(dateRange.end)}`;
    }
    return '';
  }, [view, selectedDate, dateRange]);

  const handlePrev = () => {
    if (view === 'day') {
      setSelectedDate((d) => d - 86400000);
    } else if (view === 'week') {
      setSelectedDate((d) => d - 7 * 86400000);
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setSelectedDate((d) => d + 86400000);
    } else if (view === 'week') {
      setSelectedDate((d) => d + 7 * 86400000);
    }
  };

  const openAddModal = (date?: number, category?: RecipeCategory) => {
    setEditingPlannedRecipe(null);
    setFormRecipeId(recipeOptions[0]?.value ?? '');
    setFormDate(formatDateInput(date ?? selectedDate));
    setFormCategory(category ?? 'breakfast');
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = (pm: PlannedRecipe) => {
    setEditingPlannedRecipe(pm);
    setFormRecipeId(pm.recipeId);
    setFormDate(formatDateInput(pm.date));
    setFormCategory(pm.category);
    setFormNotes(pm.notes ?? '');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPlannedRecipe(null);
  };

  const handleSubmit = async () => {
    if (!formRecipeId) return;

    const data = {
      recipeId: formRecipeId,
      date: parseDateInput(formDate),
      category: formCategory as RecipeCategory,
      notes: formNotes.trim() || null,
    };

    try {
      if (editingPlannedRecipe) {
        const updatedPlannedRecipe: PlannedRecipe = { ...editingPlannedRecipe, ...data };
        await dispatch(updatePlannedRecipeAsync(updatedPlannedRecipe)).unwrap();
      } else {
        await dispatch(createPlannedRecipeAsync(data)).unwrap();
      }
      handleModalClose();
    } catch (err) {
      console.error(editingPlannedRecipe ? 'Failed to update planned recipe:' : 'Failed to add planned recipe:', err);
      addToast({
        title: editingPlannedRecipe ? 'Failed to update planned recipe' : 'Failed to add planned recipe',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const handleDelete = async (pm: PlannedRecipe) => {
    const recipe = recipes.find((m) => m.id === pm.recipeId);

    const confirmed = await confirm({
      title: 'Remove Planned Recipe',
      message: `Remove "${recipe?.title ?? 'this recipe'}" from your plan? This cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!confirmed) return;

    try {
      await dispatch(deletePlannedRecipeAsync(pm.id)).unwrap();
    } catch (err) {
      console.error('Failed to remove planned recipe:', err);
      addToast({
        title: 'Failed to remove planned recipe',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingPlannedRecipe) return;
    const recipe = recipes.find((m) => m.id === editingPlannedRecipe.recipeId);

    const confirmed = await confirm({
      title: 'Remove Planned Recipe',
      message: `Remove "${recipe?.title ?? 'this recipe'}" from your plan? This cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!confirmed) return;

    try {
      await dispatch(deletePlannedRecipeAsync(editingPlannedRecipe.id)).unwrap();
      handleModalClose();
    } catch (err) {
      console.error('Failed to remove planned recipe:', err);
      addToast({
        title: 'Failed to remove planned recipe',
        description: 'An error occurred. Please try again.',
        type: 'destructive',
      });
    }
  };

  const isWeekOrCustom = view === 'week' || view === 'custom';

  const handleDetailEdit = (pm: PlannedRecipe) => {
    setDetailDay(null);
    openEditModal(pm);
  };

  const handleMonthDateSelect = (date: number) => {
    setSelectedDate(date);
    setView('day');
  };

  const handleGoToDay = (date: number) => {
    setSelectedDate(date);
    setView('day');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto mt-10 md:mt-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">Recipe Planner</h1>
          <Button onClick={() => openAddModal()} variant="primary">
            Add Recipe
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Plan your recipes for the day, week, or any custom period.
        </p>

        {/* View Tabs */}
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as CalendarView)}
          variant="pills"
          tabsList={[
            { value: 'month', label: '🗓️ Month' },
            { value: 'day', label: '📅 Day' },
            { value: 'week', label: '📆 Week' },
            { value: 'custom', label: '⚙️ Custom' },
          ]}
        >
          <TabsContent value="month" />
          <TabsContent value="day" />
          <TabsContent value="week" />
          <TabsContent value="custom" />
        </Tabs>

        {/* Date navigation for Day/Week only */}
        {view !== 'custom' && view !== 'month' && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={handlePrev}>
              ←
            </Button>
            <span className="text-foreground font-medium">{dateRangeLabel}</span>
            <Button variant="secondary" size="sm" onClick={handleNext}>
              →
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setSelectedDate(getStartOfDay(Date.now()))}
              className="ml-1 border border-border"
            >
              {view === 'day' ? 'Today' : 'This Week'}
            </Button>
          </div>
        )}

        {/* Custom date range picker */}
        {view === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Label>From:</Label>
              <Input
                type="date"
                value={formatDateInput(customStart)}
                onChange={(e) => setCustomStart(parseDateInput(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>To:</Label>
              <Input
                type="date"
                value={formatDateInput(customEnd)}
                onChange={(e) => {
                  const next = parseDateInput(e.target.value);
                  if (next >= customStart) setCustomEnd(next);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Month View */}
      {view === 'month' && (
        <MonthView plannedRecipes={plannedRecipes} onDateSelect={handleMonthDateSelect} />
      )}

      {/* Totals (hidden for month view) */}
      {view !== 'month' && <TotalsCard totals={totals} dayCount={visibleDays.length} />}

      {/* Recipe Plan Grid */}
      {view !== 'month' && (
        view === 'custom' && customEnd < customStart ? (
          <div className="text-center py-12 text-muted-foreground">
            End date must be on or after the start date.
          </div>
        ) : (
          <div
            className={join(
              isWeekOrCustom
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-6'
            )}
          >
            {visibleDays.map((day) => (
              <DayCard
                key={day}
                day={day}
                compact={isWeekOrCustom}
                plannedRecipes={visiblePlannedRecipes.filter((pm) => getStartOfDay(pm.date) === day)}
                recipes={recipes}
                ingredients={ingredients}
                onAdd={openAddModal}
                onEdit={openEditModal}
                onViewDetail={setDetailDay}
                onGoToDay={handleGoToDay}
              />
            ))}
          </div>
        )
      )}

      {/* Day Detail Modal */}
      <DayDetailModal
        day={detailDay}
        plannedRecipes={plannedRecipes}
        recipes={recipes}
        ingredients={ingredients}
        onClose={() => setDetailDay(null)}
        onEdit={handleDetailEdit}
        onDelete={handleDelete}
      />

      {/* Add / Edit Planned Recipe Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingPlannedRecipe ? 'Edit Planned Recipe' : 'Add a Recipe'}
        actions={[
          { label: 'Cancel', variant: 'secondary', onClick: handleModalClose },
          {
            label: editingPlannedRecipe ? 'Save Changes' : 'Add Recipe',
            variant: 'primary',
            onClick: () => { void handleSubmit(); },
          },
        ]}
      >
        <div className="space-y-4 min-w-0 sm:min-w-80">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Recipe *</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Show stats</span>
                <Toggle
                  size="sm"
                  checked={showRecipeStats}
                  onCheckedChange={setShowRecipeStats}
                  aria-label="Toggle recipe stats in dropdown"
                />
              </div>
            </div>
            <Select
              options={recipeOptions}
              value={formRecipeId}
              onChange={setFormRecipeId}
              placeholder="Select a recipe"
              searchable
              searchPlaceholder="Search recipes..."
            />
          </div>
          <div>
            <Label>Date *</Label>
            <Input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Category *</Label>
            <Select
              options={RECIPE_CATEGORY_OPTIONS}
              value={formCategory}
              onChange={setFormCategory}
              placeholder="Select category"
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Add optional notes..."
              rows={2}
            />
          </div>
          {editingPlannedRecipe && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { void handleDeleteFromModal(); }}
                className="w-full text-destructive border-destructive/40 hover:bg-destructive/10"
              >
                🗑️ Delete Planned Recipe
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default CalendarScreen;
