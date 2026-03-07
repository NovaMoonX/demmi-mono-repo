import { MealCategory } from '@lib/meals';

export interface PlannedMeal {
  id: string;
  mealId: string;
  date: number; // start-of-day timestamp (ms)
  category: MealCategory;
  notes: string | null;
}

export type CalendarView = 'month' | 'day' | 'week' | 'custom';
