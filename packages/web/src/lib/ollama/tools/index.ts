import { registerTools } from './tool.registry';
import { recipeTools } from './recipe.tools';
import { ingredientTools } from './ingredient.tools';
import { calendarTools } from './calendar.tools';
import { shoppingTools } from './shopping.tools';
import { memoryTools } from './memory.tools';
import { profileTools } from './profile.tools';

export function initializeTools(): void {
  registerTools(recipeTools);
  registerTools(ingredientTools);
  registerTools(calendarTools);
  registerTools(shoppingTools);
  registerTools(memoryTools);
  registerTools(profileTools);
}

export * from './tool.types';
export * from './tool.registry';
export { recipeTools } from './recipe.tools';
export { ingredientTools } from './ingredient.tools';
export { calendarTools } from './calendar.tools';
export { shoppingTools } from './shopping.tools';
export { memoryTools } from './memory.tools';
export { profileTools } from './profile.tools';
