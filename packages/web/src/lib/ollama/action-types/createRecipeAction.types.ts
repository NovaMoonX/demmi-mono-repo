import type { RecipeCategory, RecipeCuisineType } from '@lib/recipes';
import type { IngredientType, MeasurementUnit } from '@lib/ingredients';

/**
 * Status types are organized per action type for long-term maintainability.
 * When adding a new action, define its own status type and union it into AgentActionStatus.
 *
 * create_recipe lifecycle:
 *  pending_confirmation  → user confirms intent (Yes/No)
 *       ↓ Yes
 *  generating_name       → Step 1: generating recipe name
 *  generating_info       → Step 2: generating basic info (category, servings, time)
 *  generating_description→ Step 3: generating description
 *  generating_ingredients→ Step 4: generating ingredients
 *  generating_instructions→Step 5: generating instructions
 *       ↓
 *  pending_approval      → recipe ready; user reviews & saves (or declines)
 *       ↓ user replies to refine
 *  iterating             → AI is detecting & updating only the changed fields
 *       ↓
 *  pending_approval      → updated proposal; user reviews again
 *       ↓ previous pending_approval card when iterating starts
 *  stale                 → previous proposal snapshot (read-only, superseded)
 *       ↓
 *  approved / rejected / cancelled → terminal states
 */
export type CreateRecipeAgentActionStatus =
  | 'pending_confirmation'
  | 'generating_name'
  | 'generating_info'
  | 'generating_description'
  | 'generating_ingredients'
  | 'generating_instructions'
  | 'iterating'
  | 'stale'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type RecipeStep = 'name' | 'info' | 'description' | 'ingredients' | 'instructions';

/** Fields of a recipe proposal that can be selectively regenerated during iteration. */
export type RecipeIterableField = 'name' | 'info' | 'description' | 'ingredients' | 'instructions';

export interface AgentIngredientProposal {
  name: string;
  type: IngredientType;
  unit: MeasurementUnit;
  servings: number;
  isNew: boolean;
  existingIngredientId: string | null;
}

export interface AgentRecipeProposal {
  title: string;
  description: string;
  category: RecipeCategory;
  cuisine: RecipeCuisineType;
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
  cuisine: string | null;
  servings: number | null;
  totalTime: number | null;
  description: string | null;
  ingredients: Array<{ name: string; amount: string }> | null;
  instructions: string[] | null;
}

export interface AgentCreateRecipeAction {
  type: 'create_recipe';
  status: CreateRecipeAgentActionStatus;
  proposedName: string;
  recipes: AgentRecipeProposal[];
  recipe: AgentPartialRecipe | null;
  completedSteps: RecipeStep[] | null;
  /** Fields being regenerated during an iteration pass. Null when not iterating. */
  updatingFields: RecipeIterableField[] | null;
  /** Persisted decision for the shopping list prompt. Null = not yet decided (prompt visible).
   *  'added' = user confirmed; 'skipped' = user declined. */
  shoppingListDecision: 'added' | 'skipped' | null;
  /** Number of ingredients actually added to the shopping list (0 if skipped or all duplicates). */
  shoppingListItemsAdded: number | null;
}