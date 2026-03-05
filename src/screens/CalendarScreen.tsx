import { useState, useMemo } from 'react';
import {
  Button,
  Card,
  Badge,
  Modal,
  Select,
  Input,
  Textarea,
  Tabs,
  TabsContent,
} from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { addPlannedMeal, updatePlannedMeal, removePlannedMeal } from '@store/slices/calendarSlice';
import { PlannedMeal, CalendarView } from '@lib/calendar';
import { Meal, MealCategory } from '@lib/meals';
import { Ingredient } from '@lib/ingredients';

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'];

const CATEGORY_OPTIONS = [
  { value: 'breakfast', text: '🌅 Breakfast' },
  { value: 'lunch', text: '🍱 Lunch' },
  { value: 'dinner', text: '🌙 Dinner' },
  { value: 'snack', text: '🍿 Snack' },
  { value: 'dessert', text: '🍰 Dessert' },
  { value: 'drink', text: '🥤 Drink' },
];

const CATEGORY_EMOJIS: Record<MealCategory, string> = {
  breakfast: '🌅',
  lunch: '🍱',
  dinner: '🌙',
  snack: '🍿',
  dessert: '🍰',
  drink: '🥤',
};

const CATEGORY_COLORS: Record<MealCategory, string> = {
  breakfast: 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  lunch: 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  dinner: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  snack: 'bg-purple-500/20 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  dessert: 'bg-pink-500/20 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
  drink: 'bg-cyan-500/20 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
};

// ─── Date Utilities ──────────────────────────────────────────────────────────

function getStartOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getWeekStart(ts: number): number {
  const d = new Date(getStartOfDay(ts));
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.getTime();
}

function getDaysInRange(start: number, end: number): number[] {
  const days: number[] = [];
  let current = getStartOfDay(start);
  const endDay = getStartOfDay(end);
  while (current <= endDay) {
    days.push(current);
    current += 86400000;
  }
  return days;
}

function formatDateFull(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateShort(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDayShort(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDateInput(ts: number): string {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): number {
  const result = getStartOfDay(new Date(`${value}T00:00:00`).getTime());
  return result;
}

// ─── Nutrition & Price Calculation ──────────────────────────────────────────

interface NutrientTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  price: number;
}

function getPricePerServing(ingredient: Ingredient): number {
  const product = ingredient.defaultProductId
    ? (ingredient.products.find((p) => p.id === ingredient.defaultProductId) ??
      ingredient.products[0])
    : ingredient.products[0];

  if (!product || product.servings <= 0) return 0;

  return product.cost / product.servings;
}

function calculateTotals(
  plannedMeals: PlannedMeal[],
  meals: Meal[],
  ingredients: Ingredient[]
): NutrientTotals {
  const totals: NutrientTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    price: 0,
  };

  for (const pm of plannedMeals) {
    const meal = meals.find((m) => m.id === pm.mealId);
    if (!meal) continue;

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
  }

  return totals;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TotalItem({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function TotalsCard({ totals }: { totals: NutrientTotals }) {
  return (
    <Card className="mb-6 p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">Totals for Period</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        <TotalItem label="Calories" value={`${Math.round(totals.calories)} kcal`} emoji="🔥" />
        <TotalItem label="Price" value={`$${totals.price.toFixed(2)}`} emoji="💰" />
        <TotalItem label="Protein" value={`${Math.round(totals.protein)}g`} emoji="💪" />
        <TotalItem label="Carbs" value={`${Math.round(totals.carbs)}g`} emoji="🌾" />
        <TotalItem label="Fat" value={`${Math.round(totals.fat)}g`} emoji="🥑" />
        <TotalItem label="Fiber" value={`${Math.round(totals.fiber)}g`} emoji="🥦" />
      </div>
    </Card>
  );
}

interface DayCardProps {
  day: number;
  plannedMeals: PlannedMeal[];
  meals: Meal[];
  compact: boolean;
  onAdd: (date: number, category?: MealCategory) => void;
  onEdit: (pm: PlannedMeal) => void;
  onDelete: (pm: PlannedMeal) => void;
}

function DayCard({ day, plannedMeals, meals, compact, onAdd, onEdit, onDelete }: DayCardProps) {
  const hasMeals = plannedMeals.length > 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          {compact ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                {formatDayShort(day)}
              </p>
              <p className="text-sm font-semibold text-foreground">{formatDateShort(day)}</p>
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-foreground">{formatDateFull(day)}</h2>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => onAdd(day)}>
          + Add
        </Button>
      </div>

      {!hasMeals ? (
        <p className="text-xs text-muted-foreground text-center py-3">No meals planned.</p>
      ) : (
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const catMeals = plannedMeals.filter((pm) => pm.category === cat);
            if (catMeals.length === 0) return null;

            return (
              <div key={cat}>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>{CATEGORY_EMOJIS[cat]}</span>
                  <span className="capitalize">{cat}</span>
                </p>
                <div className="space-y-1.5 pl-3">
                  {catMeals.map((pm) => {
                    const meal = meals.find((m) => m.id === pm.mealId);
                    return (
                      <div
                        key={pm.id}
                        className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-1.5 gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge
                            variant="base"
                            className={join('capitalize shrink-0 text-xs', CATEGORY_COLORS[cat])}
                          >
                            {cat}
                          </Badge>
                          <span className="text-sm font-medium text-foreground truncate">
                            {meal?.title ?? 'Unknown Meal'}
                          </span>
                          {pm.notes && (
                            <span className="text-xs text-muted-foreground truncate hidden sm:block">
                              — {pm.notes}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => onEdit(pm)}
                            aria-label="Edit planned meal"
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => onDelete(pm)}
                            aria-label="Remove planned meal"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant="tertiary"
            size="sm"
            onClick={() => onAdd(day, cat)}
            className="text-xs border border-dashed border-border"
          >
            {CATEGORY_EMOJIS[cat]} +
          </Button>
        ))}
      </div>
    </Card>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function CalendarScreen() {
  const [view, setView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState(() => getStartOfDay(Date.now()));
  const [customStart, setCustomStart] = useState(() => getStartOfDay(Date.now()));
  const [customEnd, setCustomEnd] = useState(() =>
    getStartOfDay(Date.now() + 6 * 86400000)
  );

  const [showModal, setShowModal] = useState(false);
  const [editingPlannedMeal, setEditingPlannedMeal] = useState<PlannedMeal | null>(null);

  const [formMealId, setFormMealId] = useState('');
  const [formDate, setFormDate] = useState(() => formatDateInput(getStartOfDay(Date.now())));
  const [formCategory, setFormCategory] = useState<string>('breakfast');
  const [formNotes, setFormNotes] = useState('');

  const plannedMeals = useAppSelector((state) => state.calendar.plannedMeals);
  const meals = useAppSelector((state) => state.meals.items);
  const ingredients = useAppSelector((state) => state.ingredients.items);
  const dispatch = useAppDispatch();
  const { confirm } = useActionModal();

  const mealOptions = useMemo(
    () => meals.map((m) => ({ value: m.id, text: m.title })),
    [meals]
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

  const isWeekOrCustom = view === 'week' || view === 'custom';

  return (
    <div className="p-6 max-w-7xl mx-auto mt-10 md:mt-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">Meal Planner</h1>
          <Button onClick={() => openAddModal()} variant="primary">
            Plan Meal
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
            { value: 'day', label: '📅 Day' },
            { value: 'week', label: '📆 Week' },
            { value: 'custom', label: '🗓️ Custom' },
          ]}
        >
          <TabsContent value="day" />
          <TabsContent value="week" />
          <TabsContent value="custom" />
        </Tabs>

        {/* Date navigation for Day/Week */}
        {view !== 'custom' && (
          <div className="flex items-center gap-3 mt-4">
            <Button variant="secondary" size="sm" onClick={handlePrev}>
              ←
            </Button>
            <span className="text-foreground font-medium">{dateRangeLabel}</span>
            <Button variant="secondary" size="sm" onClick={handleNext}>
              →
            </Button>
          </div>
        )}

        {/* Custom date range picker */}
        {view === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">From:</label>
              <Input
                type="date"
                value={formatDateInput(customStart)}
                onChange={(e) => setCustomStart(parseDateInput(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">To:</label>
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

      {/* Totals */}
      <TotalsCard totals={totals} />

      {/* Meal Plan Grid */}
      {view === 'custom' && customEnd < customStart ? (
        <div className="text-center py-12 text-muted-foreground">
          End date must be on or after the start date.
        </div>
      ) : (
        <div
          className={join(
            isWeekOrCustom
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
          )}
        >
          {visibleDays.map((day) => (
            <DayCard
              key={day}
              day={day}
              compact={isWeekOrCustom}
              plannedMeals={visiblePlannedMeals.filter((pm) => getStartOfDay(pm.date) === day)}
              meals={meals}
              onAdd={openAddModal}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Planned Meal Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingPlannedMeal ? 'Edit Planned Meal' : 'Plan a Meal'}
        actions={[
          { label: 'Cancel', variant: 'secondary', onClick: handleModalClose },
          {
            label: editingPlannedMeal ? 'Save Changes' : 'Add to Plan',
            variant: 'primary',
            onClick: handleSubmit,
          },
        ]}
      >
        <div className="space-y-4 min-w-0 sm:min-w-80">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Meal *</label>
            <Select
              options={mealOptions}
              value={formMealId}
              onChange={setFormMealId}
              placeholder="Select a meal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date *</label>
            <Input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
            <Select
              options={CATEGORY_OPTIONS}
              value={formCategory}
              onChange={setFormCategory}
              placeholder="Select category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <Textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Add optional notes..."
              rows={2}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CalendarScreen;
