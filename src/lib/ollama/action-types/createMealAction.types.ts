import type { MealCategory } from '@lib/meals';
import type { IngredientType, MeasurementUnit } from '@lib/ingredients';

/**
 * Status types are organized per action type for long-term maintainability.
 * When adding a new action, define its own status type and union it into AgentActionStatus.
 *
 * create_meal lifecycle:
 *  pending_confirmation  → user confirms intent (Yes/No)
 *       ↓ Yes
 *  generating_name       → Step 1: generating meal name
 *  generating_info       → Step 2: generating basic info (category, servings, time)
 *  generating_description→ Step 3: generating description
 *  generating_ingredients→ Step 4: generating ingredients
 *  generating_instructions→Step 5: generating instructions
 *       ↓
 *  pending_approval      → recipe ready; user reviews & saves (or declines)
 *       ↓
 *  approved / rejected / cancelled → terminal states
 */
export type CreateMealAgentActionStatus =
  | 'pending_confirmation'
  | 'generating_name'
  | 'generating_info'
  | 'generating_description'
  | 'generating_ingredients'
  | 'generating_instructions'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type RecipeStep = 'name' | 'info' | 'description' | 'ingredients' | 'instructions';

export interface AgentIngredientProposal {
  name: string;
  type: IngredientType;
  unit: MeasurementUnit;
  servings: number;
  isNew: boolean;
  existingIngredientId: string | null;
}

export interface AgentMealProposal {
  title: string;
  description: string;
  category: MealCategory;
  prepTime: number;
  cookTime: number;
  servingSize: number;
  instructions: string[];
  imageUrl: string;
  ingredients: AgentIngredientProposal[];
}

export interface AgentPartialRecipe {
  name: string | null;
  category: string | null;
  servings: number | null;
  totalTime: number | null;
  description: string | null;
  ingredients: Array<{ name: string; amount: string }> | null;
  instructions: string[] | null;
}

export interface AgentCreateMealAction {
  type: 'create_meal';
  status: CreateMealAgentActionStatus;
  proposedName: string;
  meals: AgentMealProposal[];
  recipe: AgentPartialRecipe | null;
  completedSteps: RecipeStep[] | null;
}