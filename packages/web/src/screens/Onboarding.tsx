import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import type { UserProfile } from '@lib/userProfile';
import { useOnboardingStep } from '@hooks/useOnboardingStep';
import { useAppDispatch } from '@store/hooks';
import { saveUserProfile } from '@store/actions/userProfileActions';
import { createIngredient } from '@store/actions/ingredientActions';
import {
  StepWelcome,
  StepGoal,
  StepDietary,
  StepCuisines,
  StepHousehold,
  StepSkill,
  StepCookTime,
  StepGoalDetails,
  StepStarterIngredients,
  StepLovedMeal,
  StepDislikedMeal,
  StepAISuggestions,
  StepComplete,
  type OnboardingFormData,
} from '@components/onboarding';

const GOAL_DETAILS_GOALS = ['track-macros', 'save-money', 'meal-prep'];

function ScrollFade({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const updateGradients = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setShowTop(el.scrollTop > 8);
    setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  useEffect(() => {
    updateGradients();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateGradients, { passive: true });
    const ro = new ResizeObserver(updateGradients);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateGradients);
      ro.disconnect();
    };
  }, [updateGradients]);

  return (
    <div className='relative min-h-0 flex-1 overflow-hidden'>
      <div
        className={join(
          'from-background pointer-events-none absolute left-0 right-0 top-0 z-10 h-10 bg-gradient-to-b to-transparent transition-opacity duration-200',
          showTop ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={containerRef}
        className='h-full overflow-y-auto'
        style={{ scrollbarWidth: 'none' }}
      >
        <div className='mx-auto max-w-lg px-4 py-6'>{children}</div>
      </div>
      <div
        className={join(
          'from-background pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-10 bg-gradient-to-t to-transparent transition-opacity duration-200',
          showBottom ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
}

export function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>({});
  const { visible } = useOnboardingStep(step);

  const update = (data: Partial<OnboardingFormData>) =>
    setFormData((prev) => ({ ...prev, ...data }));

  const handleCompletion = async () => {
    const { _starterIngredients, ...profileData } = formData;
    dispatch(
      saveUserProfile({
        ...(profileData as Partial<UserProfile>),
        onboardingCompletedAt: Date.now(),
      }),
    );
    await Promise.all(
      (_starterIngredients ?? []).map((name) =>
        dispatch(
          createIngredient({
            name,
            type: 'other',
            imageUrl: '',
            nutrients: {
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              sugar: 0,
              sodium: 0,
              calories: 0,
            },
            currentAmount: 1,
            servingSize: 1,
            unit: 'piece',
            otherUnit: null,
            products: [],
            defaultProductId: null,
            barcode: null,
          }),
        ),
      ),
    );
    navigate('/');
  };

  const showGoalDetails = (formData.cookingGoal ?? []).some((g) =>
    GOAL_DETAILS_GOALS.includes(g),
  );

  const next = () => {
    if (step >= steps.length - 1) {
      handleCompletion();
    } else {
      setStep((s) => s + 1);
    }
  };

  const previous = () => setStep((s) => s - 1);
  const skip = () => next();

  const stepProps = { formData, update, next, skip, back: previous };

  const steps = [
    <StepWelcome key='welcome' {...stepProps} />,
    <StepGoal key='goal' {...stepProps} />,
    <StepDietary key='dietary' {...stepProps} />,
    <StepCuisines key='cuisines' {...stepProps} />,
    <StepHousehold key='household' {...stepProps} />,
    <StepSkill key='skill' {...stepProps} />,
    <StepCookTime key='cook-time' {...stepProps} />,
    ...(showGoalDetails ? [<StepGoalDetails key='goal-details' {...stepProps} />] : []),
    <StepStarterIngredients key='starter-ingredients' {...stepProps} />,
    <StepLovedMeal key='loved-meal' {...stepProps} />,
    <StepDislikedMeal key='disliked-meal' {...stepProps} />,
    <StepAISuggestions key='ai-suggestions' {...stepProps} />,
    <StepComplete key='complete' {...stepProps} />,
  ];

  const lastStepIndex = steps.length - 1;
  const visibleStepCount = lastStepIndex - 1; // exclude welcome (0) and complete (last)
  const progressPercent =
    step === 0 ? 0 : Math.round(((step - 1) / visibleStepCount) * 100);

  const currentStepKey = steps[step]?.key as string | undefined;
  const isSelfNavigating = ['starter-ingredients', 'ai-suggestions', 'complete'].includes(
    currentStepKey ?? '',
  );

  const isNextDisabled =
    (step === 1 && !formData.cookingGoal?.length) ||
    (step === 4 && formData.householdSize === null);

  const showHeader = step > 0 && step < lastStepIndex;

  return (
    <div className='bg-background flex h-screen flex-col'>
      {showHeader && (
        <header className='border-border shrink-0 border-b px-4 py-3'>
          <div className='mx-auto max-w-lg space-y-2'>
            <span className='text-muted-foreground text-xs'>
              Step {step} of {visibleStepCount}
            </span>
            <div className='bg-muted h-1.5 w-full overflow-hidden rounded-full'>
              <div
                className='bg-primary h-full rounded-full transition-all duration-300'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>
      )}

      <div
        className={join(
          'flex min-h-0 flex-1 transition-opacity duration-300',
          step === 0 || step === lastStepIndex ? 'items-center justify-center' : '',
        )}
        style={{ opacity: visible ? 1 : 0 }}
      >
        {step === 0 || step === lastStepIndex ? (
          <div className='mx-auto max-w-lg px-4'>{steps[step]}</div>
        ) : (
          <ScrollFade>{steps[step]}</ScrollFade>
        )}
      </div>

      {step === 0 ? (
        <footer className='border-border shrink-0 border-t px-4 py-3'>
          <div className='mx-auto max-w-lg'>
            <div className='flex items-center justify-between gap-3'>
              <Button variant='secondary' onClick={() => navigate('/')}>
                Skip setup
              </Button>
              <Button variant='primary' onClick={next}>
                Let's go
              </Button>
            </div>
          </div>
        </footer>
      ) : !isSelfNavigating ? (
        <footer className='border-border shrink-0 border-t px-4 py-3'>
          <div className='mx-auto max-w-lg'>
            <div className='flex items-center justify-between gap-3'>
              <Button variant='secondary' onClick={previous} disabled={step <= 1}>
                ← Previous
              </Button>
              <div className='flex items-center gap-2'>
                <Button variant='tertiary' onClick={skip}>
                  Skip
                </Button>
                <Button variant='primary' onClick={next} disabled={isNextDisabled}>
                  Next →
                </Button>
              </div>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

export default Onboarding;
