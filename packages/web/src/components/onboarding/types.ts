import type { UserProfile } from '@lib/userProfile';
import type { RecipeCategory } from '@lib/recipes';

export interface SuggestedRecipe {
  title: string;
  category: RecipeCategory;
  description: string;
}

export type OnboardingFormData = Partial<UserProfile> & {
  _starterIngredients?: string[];
};

export interface StepProps {
  formData: OnboardingFormData;
  update: (data: Partial<OnboardingFormData>) => void;
  next: () => void;
  skip: () => void;
  back: () => void;
}

export interface StepAISuggestionsProps extends StepProps {
  aiRecipes: SuggestedRecipe[];
  aiLoading: boolean;
}

export interface StepProfileSummaryProps extends StepProps {
  aiLoading: boolean;
}
