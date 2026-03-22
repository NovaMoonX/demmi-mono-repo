import { DEMO_USER_ID } from '@lib/app';
import { PlannedRecipe } from './calendar.types';

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function generateDemoCalendarData(): Omit<PlannedRecipe, 'id'>[] {
  const today = startOfDay(new Date());
  const yesterday = today - DAY_MS;
  const tomorrow = today + DAY_MS;
  const dayAfterTomorrow = today + 2 * DAY_MS;

  return [
    // Yesterday
    { userId: DEMO_USER_ID, recipeId: 'recipe-007', date: yesterday, category: 'breakfast', notes: null },
    { userId: DEMO_USER_ID, recipeId: 'recipe-004', date: yesterday, category: 'snack', notes: null },
    { userId: DEMO_USER_ID, recipeId: 'recipe-002', date: yesterday, category: 'lunch', notes: null },
    { userId: DEMO_USER_ID, recipeId: 'recipe-003', date: yesterday, category: 'dinner', notes: 'Made enough for leftovers' },
    // Today
    { userId: DEMO_USER_ID, recipeId: 'recipe-001', date: today, category: 'breakfast', notes: 'Add blueberries on top' },
    { userId: DEMO_USER_ID, recipeId: 'recipe-006', date: today, category: 'drink', notes: 'Morning smoothie' },
    { userId: DEMO_USER_ID, recipeId: 'recipe-002', date: today, category: 'lunch', notes: null },
    { userId: DEMO_USER_ID, recipeId: 'recipe-004', date: today, category: 'snack', notes: null },
    { userId: DEMO_USER_ID, recipeId: 'recipe-008', date: today, category: 'dinner', notes: 'Taco night!' },
    { userId: DEMO_USER_ID, recipeId: 'recipe-005', date: today, category: 'dessert', notes: 'Special treat' },
    // Tomorrow
    { userId: DEMO_USER_ID, recipeId: 'recipe-007', date: tomorrow, category: 'breakfast', notes: null },
    { userId: DEMO_USER_ID, recipeId: 'recipe-006', date: tomorrow, category: 'drink', notes: null },
    { userId: DEMO_USER_ID, recipeId: 'recipe-002', date: tomorrow, category: 'lunch', notes: 'Recipe prepped' },
    { userId: DEMO_USER_ID, recipeId: 'recipe-003', date: tomorrow, category: 'dinner', notes: null },
    // Day after tomorrow
    { userId: DEMO_USER_ID, recipeId: 'recipe-001', date: dayAfterTomorrow, category: 'breakfast', notes: null },
    { userId: DEMO_USER_ID, recipeId: 'recipe-008', date: dayAfterTomorrow, category: 'dinner', notes: null },
    { userId: DEMO_USER_ID, recipeId: 'recipe-004', date: dayAfterTomorrow, category: 'snack', notes: null },
  ];
}
