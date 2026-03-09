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
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { addPlannedMeal, updatePlannedMeal, removePlannedMeal } from '@store/slices/calendarSlice';
import { PlannedMeal, CalendarView, NutrientTotals } from '@lib/calendar';
import { Meal, MEAL_CATEGORY_OPTIONS, MealCategory } from '@lib/meals';
import { Ingredient } from '@lib/ingredients';
import { TotalsCard, DayCard, DayDetailModal, MonthView } from '@components/calendar';
import { getPricePerServing } from '@/lib/ingredients/ingredients.utils';
import { formatDateFull, formatDateInput, formatDateShort, getDaysInRange, getStartOfDay, getWeekStart, parseDateInput } from '@/utils';
import { calculateTotals } from '@/lib/calendar/calendar.utils';

function calculateMealTotals(meal: Meal, ingredients: Ingredient[]): NutrientTotals {
  const totals: NutrientTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, price: 0 };
  for (const mi of meal.ingredients) {
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
  const [editingPlannedMeal, setEditingPlannedMeal] = useState<PlannedMeal | null>(null);
  const [detailDay, setDetailDay] = useState<number | null>(null);

  const [formMealId, setFormMealId] = useState('');
  const [formDate, setFormDate] = useState(() => formatDateInput(getStartOfDay(Date.now())));
  const [formCategory, setFormCategory] = useState<string>('breakfast');
  const [formNotes, setFormNotes] = useState('');
  const [showMealStats, setShowMealStats] = useState(false);

  const plannedMeals = useAppSelector((state) => state.calendar.plannedMeals);
  const meals = useAppSelector((state) => state.meals.items);
  const ingredients = useAppSelector((state) => state.ingredients.items);
  const dispatch = useAppDispatch();
  const { confirm } = useActionModal();

  const mealOptions = useMemo(
    () =>
      meals.map((m) => {
        if (!showMealStats) return { value: m.id, text: m.title };
        const t = calculateMealTotals(m, ingredients);
        const description = `🔥 ${Math.round(t.calories)} kcal · 💪 ${Math.round(t.protein)}g · 🌾 ${Math.round(t.carbs)}g · 🥑 ${Math.round(t.fat)}g · 💰 $${t.price.toFixed(2)}`;
        return { value: m.id, text: m.title, description };
      }),
    [meals, ingredients, showMealStats]
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

  const visiblePlannedMeals = useMemo(
    () =>
      plannedMeals.filter((pm) => {
        const pmDay = getStartOfDay(pm.date);
        return pmDay >= dateRange.start && pmDay <= dateRange.end;
      }),
    [plannedMeals, dateRange]
  );

  const totals = useMemo(
    () => calculateTotals(visiblePlannedMeals, meals, ingredients),
    [visiblePlannedMeals, meals, ingredients]
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

  const openAddModal = (date?: number, category?: MealCategory) => {
    setEditingPlannedMeal(null);
    setFormMealId(mealOptions[0]?.value ?? '');
    setFormDate(formatDateInput(date ?? selectedDate));
    setFormCategory(category ?? 'breakfast');
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = (pm: PlannedMeal) => {
    setEditingPlannedMeal(pm);
    setFormMealId(pm.mealId);
    setFormDate(formatDateInput(pm.date));
    setFormCategory(pm.category);
    setFormNotes(pm.notes ?? '');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPlannedMeal(null);
  };

  const handleSubmit = () => {
    if (!formMealId) return;

    const data = {
      mealId: formMealId,
      date: parseDateInput(formDate),
      category: formCategory as MealCategory,
      notes: formNotes.trim() || null,
    };

    if (editingPlannedMeal) {
      dispatch(updatePlannedMeal({ id: editingPlannedMeal.id, updates: data }));
    } else {
      dispatch(addPlannedMeal(data));
    }

    handleModalClose();
  };

  const handleDelete = async (pm: PlannedMeal) => {
    const meal = meals.find((m) => m.id === pm.mealId);

    const confirmed = await confirm({
      title: 'Remove Planned Meal',
      message: `Remove "${meal?.title ?? 'this meal'}" from your plan? This cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (confirmed) {
      dispatch(removePlannedMeal(pm.id));
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingPlannedMeal) return;
    const meal = meals.find((m) => m.id === editingPlannedMeal.mealId);

    const confirmed = await confirm({
      title: 'Remove Planned Meal',
      message: `Remove "${meal?.title ?? 'this meal'}" from your plan? This cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (confirmed) {
      dispatch(removePlannedMeal(editingPlannedMeal.id));
      handleModalClose();
    }
  };

  const isWeekOrCustom = view === 'week' || view === 'custom';

  const handleDetailEdit = (pm: PlannedMeal) => {
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
          <h1 className="text-4xl font-bold text-foreground">Meal Planner</h1>
          <Button onClick={() => openAddModal()} variant="primary">
            Add Meal
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Plan your meals for the day, week, or any custom period.
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
        <MonthView plannedMeals={plannedMeals} onDateSelect={handleMonthDateSelect} />
      )}

      {/* Totals (hidden for month view) */}
      {view !== 'month' && <TotalsCard totals={totals} dayCount={visibleDays.length} />}

      {/* Meal Plan Grid */}
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
                plannedMeals={visiblePlannedMeals.filter((pm) => getStartOfDay(pm.date) === day)}
                meals={meals}
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
        plannedMeals={plannedMeals}
        meals={meals}
        ingredients={ingredients}
        onClose={() => setDetailDay(null)}
        onEdit={handleDetailEdit}
        onDelete={handleDelete}
      />

      {/* Add / Edit Planned Meal Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingPlannedMeal ? 'Edit Planned Meal' : 'Add a Meal'}
        actions={[
          { label: 'Cancel', variant: 'secondary', onClick: handleModalClose },
          {
            label: editingPlannedMeal ? 'Save Changes' : 'Add Meal',
            variant: 'primary',
            onClick: handleSubmit,
          },
        ]}
      >
        <div className="space-y-4 min-w-0 sm:min-w-80">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Meal *</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Show stats</span>
                <Toggle
                  size="sm"
                  checked={showMealStats}
                  onCheckedChange={setShowMealStats}
                  aria-label="Toggle meal stats in dropdown"
                />
              </div>
            </div>
            <Select
              options={mealOptions}
              value={formMealId}
              onChange={setFormMealId}
              placeholder="Select a meal"
              searchable
              searchPlaceholder="Search meals..."
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
              options={MEAL_CATEGORY_OPTIONS}
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
          {editingPlannedMeal && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { void handleDeleteFromModal(); }}
                className="w-full text-destructive border-destructive/40 hover:bg-destructive/10"
              >
                🗑️ Delete Planned Meal
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default CalendarScreen;
