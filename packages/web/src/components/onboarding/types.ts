import type { UserProfile } from '@lib/userProfile';

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
