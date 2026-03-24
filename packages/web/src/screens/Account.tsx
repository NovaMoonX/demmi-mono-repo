import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Callout } from '@moondreamsdev/dreamer-ui/components';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { saveUserProfile } from '@store/actions/userProfileActions';
import type { UserProfile } from '@lib/userProfile';
import { ProfileViewMode, ProfileEditForm } from '@components/account';

export function Account() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile, loading } = useAppSelector((state) => state.userProfile);
  const [isViewMode, setIsViewMode] = useState(true);

  const handleSave = async (updates: Partial<UserProfile>) => {
    await dispatch(saveUserProfile(updates));
    setIsViewMode(true);
  };

  const handleResetOnboarding = async () => {
    await dispatch(saveUserProfile({ onboardingCompletedAt: null }));
    navigate('/onboarding');
  };

  if (loading) {
    return (
      <div className='mx-auto max-w-2xl space-y-4 p-6'>
        <Skeleton className='h-8 w-48 rounded' />
        <Skeleton className='h-5 w-64 rounded' />
        <Skeleton className='h-5 w-56 rounded' />
        <Skeleton className='h-5 w-72 rounded' />
        <Skeleton className='h-5 w-60 rounded' />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='mx-auto max-w-2xl p-6'>
        <Callout
          variant='warning'
          title='Profile not found'
          description='We could not load your profile. Please try refreshing the page.'
        />
      </div>
    );
  }

  if (!isViewMode) {
    return (
      <ProfileEditForm
        profile={profile}
        saving={loading}
        onSave={handleSave}
        onCancel={() => setIsViewMode(true)}
      />
    );
  }

  return (
    <ProfileViewMode
      profile={profile}
      onEdit={() => setIsViewMode(false)}
      onResetOnboarding={handleResetOnboarding}
    />
  );
}

export default Account;

