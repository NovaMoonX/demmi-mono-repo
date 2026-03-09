import { Calendar } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { PlannedMeal } from '@lib/calendar';
import { getStartOfDay } from '@/utils';

export interface MonthViewProps {
  plannedMeals: PlannedMeal[];
  onDateSelect: (date: number) => void;
}

export function MonthView({ plannedMeals, onDateSelect }: MonthViewProps) {
  const renderCell = (date: Date, isSelected: boolean, _isDisabled: boolean, isToday: boolean) => {
    const dayTs = getStartOfDay(date.getTime());
    const dayMeals = plannedMeals.filter((pm) => getStartOfDay(pm.date) === dayTs);

    const hasBreakfast = dayMeals.some((pm) => pm.category === 'breakfast');
    const hasLunch = dayMeals.some((pm) => pm.category === 'lunch');
    const hasDinner = dayMeals.some((pm) => pm.category === 'dinner');

    return (
      <div className="flex flex-col items-center w-full">
        <span className={join(
          'text-sm leading-none',
          isSelected && 'font-bold',
          isToday && !isSelected && 'text-primary font-semibold',
        )}>
          {date.getDate()}
        </span>
        <div className="flex gap-0.5 mt-1 h-1.5 items-center">
          {hasBreakfast && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
          {hasLunch && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          {hasDinner && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Calendar
        view="month"
        mode="single"
        size="auto"
        showNavigation={true}
        renderCell={renderCell}
        onDateSelect={(date) => onDateSelect(getStartOfDay(date.getTime()))}
      />
      <div className="flex items-center gap-5 mt-4 text-xs text-muted-foreground justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          Breakfast
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Lunch
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Dinner
        </span>
      </div>
    </div>
  );
}
