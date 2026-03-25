import type { UserProfile } from '@lib/userProfile';

export interface StepProps {
  formData: Partial<UserProfile>;
  update: (data: Partial<UserProfile>) => void;
  next: () => void;
  skip: () => void;
  back: () => void;
}
