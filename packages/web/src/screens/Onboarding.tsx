import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import type { UserProfile } from '@lib/userProfile';
import { listLocalModels, ollamaClient } from '@lib/ollama';
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
  StepProfileSummary,
  StepAISuggestions,
  StepComplete,
  type OnboardingFormData,
  type SuggestedRecipe,
} from '@components/onboarding';

const GOAL_DETAILS_GOALS = ['track-macros', 'save-money', 'meal-prep'];

const FALLBACK_RECIPES: SuggestedRecipe[] = [
  {
    title: 'Classic Pasta Bolognese',
    category: 'dinner',
    description: 'A hearty Italian meat sauce served over pasta.',
  },
  {
    title: 'Overnight Oats',
    category: 'breakfast',
    description: 'Creamy oats prepared the night before with your choice of toppings.',
  },
  {
    title: 'Vegetable Stir Fry',
    category: 'lunch',
    description: 'Quick and colorful mixed vegetables in a savory sauce.',
  },
];

const SUGGESTION_SCHEMA = {
  type: 'object',
  required: ['recipes'],
  properties: {
    recipes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'category', 'description'],
        properties: {
          title: { type: 'string' },
          category: {
            type: 'string',
            enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
          },
          description: { type: 'string' },
        },
      },
    },
  },
};

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

type StepItem = {
  key: string;
  component: React.ReactElement;
  // Optional overrides per step. `nextDisabled` can be a boolean or a function
  // that receives the latest form data.
  selfNavigating?: boolean;
  hideSkip?: boolean;
  nextDisabled?: boolean | ((data: OnboardingFormData) => boolean);
};

export function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>({});
  const [aiRecipes, setAiRecipes] = useState<SuggestedRecipe[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const aiStartedRef = useRef(false);
  // Always keep formDataRef in sync so the generation effect reads the latest values
  // at the moment it fires (not stale values from when the component first mounted).
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

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
    navigate('/recipes');
  };

  const showGoalDetails = (formData.cookingGoal ?? []).some((g) =>
    GOAL_DETAILS_GOALS.includes(g),
  );

  const next = () => {
    if (step >= stepsConfig.length - 1) {
      handleCompletion();
    } else {
      setStep((s) => s + 1);
    }
  };

  const previous = () => setStep((s) => s - 1);
  const skip = () => next();

  const stepProps = { formData, update, next, skip, back: previous };

  const stepsConfig: StepItem[] = [
    { key: 'welcome', component: <StepWelcome key='welcome' {...stepProps} /> },
    { key: 'goal', component: <StepGoal key='goal' {...stepProps} /> },
    // goal-details is conditionally inserted below when showGoalDetails is true
    { key: 'dietary', component: <StepDietary key='dietary' {...stepProps} /> },
    { key: 'cuisines', component: <StepCuisines key='cuisines' {...stepProps} /> },
    { key: 'household', component: <StepHousehold key='household' {...stepProps} /> },
    { key: 'skill', component: <StepSkill key='skill' {...stepProps} /> },
    { key: 'cook-time', component: <StepCookTime key='cook-time' {...stepProps} /> },
    {
      key: 'starter-ingredients',
      component: <StepStarterIngredients key='starter-ingredients' {...stepProps} />,
      selfNavigating: true,
    },
    { key: 'loved-meal', component: <StepLovedMeal key='loved-meal' {...stepProps} /> },
    { key: 'disliked-meal', component: <StepDislikedMeal key='disliked-meal' {...stepProps} /> },
    {
      key: 'profile-summary',
      component: <StepProfileSummary key='profile-summary' {...stepProps} aiLoading={aiLoading} />,
    },
    {
      key: 'ai-suggestions',
      component: (
        <StepAISuggestions
          key='ai-suggestions'
          {...stepProps}
          aiRecipes={aiRecipes}
          aiLoading={aiLoading}
        />
      ),
      selfNavigating: true,
    },
    { key: 'complete', component: <StepComplete key='complete' {...stepProps} />, selfNavigating: true },
  ];

  // Insert goal details step dynamically based on the current formData
  if (showGoalDetails) {
    const insertIndex = 2; // after 'goal'
    stepsConfig.splice(insertIndex, 0, {
      key: 'goal-details',
      component: <StepGoalDetails key='goal-details' {...stepProps} />,
    });
  }

  const currentStepKey = stepsConfig[step]?.key as string | undefined;

  // Start AI generation when entering the profile-summary step
  useEffect(() => {
    if (currentStepKey !== 'profile-summary') return;
    if (aiStartedRef.current) return;
    aiStartedRef.current = true;
    setAiLoading(true);

    let cancelled = false;
    const data = formDataRef.current;

    async function generate() {
      try {
        const models = await listLocalModels();
        if (cancelled) return;
        if (models.length === 0) {
          setAiRecipes(FALLBACK_RECIPES);
          setAiLoading(false);
          return;
        }

        const model = models[0];
        const goals = (data.cookingGoal ?? []).join(', ') || 'general cooking';
        const dietary = (data.dietaryRestrictions ?? []).join(', ') || 'none';
        const cuisines = (data.cuisinePreferences ?? []).join(', ') || 'any';
        const skill = data.skillLevel ?? 'intermediate';
        const cookTime = data.cookTimePreference ?? 'any';

        const response = await ollamaClient.chat({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are a recipe suggestion assistant. Suggest 3 recipes that match the user profile. Return valid JSON only.',
            },
            {
              role: 'user',
              content: `Cooking goals: ${goals}\nDietary restrictions: ${dietary}\nCuisine preferences: ${cuisines}\nSkill level: ${skill}\nCook time preference: ${cookTime}\n\nSuggest 3 recipes.`,
            },
          ],
          stream: false,
          format: SUGGESTION_SCHEMA,
        });

        if (cancelled) return;

        // JSON.parse may throw on malformed LLM output — caught by the outer try-catch
        const parsed = JSON.parse(response.message.content);
        const suggested: SuggestedRecipe[] = Array.isArray(parsed.recipes)
          ? parsed.recipes.slice(0, 3)
          : FALLBACK_RECIPES;

        setAiRecipes(suggested.length > 0 ? suggested : FALLBACK_RECIPES);
      } catch {
        if (!cancelled) {
          setAiRecipes(FALLBACK_RECIPES);
        }
      } finally {
        if (!cancelled) {
          setAiLoading(false);
        }
      }
    }

    generate();
    return () => {
      cancelled = true;
    };
  }, [currentStepKey]);

  const lastStepIndex = stepsConfig.length - 1;
  const visibleStepCount = lastStepIndex - 1; // exclude welcome (0) and complete (last)
  const progressPercent =
    step === 0 ? 0 : Math.round(((step - 1) / visibleStepCount) * 100);

  const isSelfNavigating = stepsConfig[step]?.selfNavigating ?? false;

  const hideSkip =
    stepsConfig[step]?.hideSkip ?? (currentStepKey === 'goal' || currentStepKey === 'goal-details');

  const computeNextDisabled = () => {
    const cfg = stepsConfig[step];
    if (!cfg) return false;
    if (typeof cfg.nextDisabled === 'function') return cfg.nextDisabled(formData);
    if (typeof cfg.nextDisabled === 'boolean') return cfg.nextDisabled;

    // fallback default rules
    return (
      (currentStepKey === 'goal' && !formData.cookingGoal?.length) ||
      (currentStepKey === 'household' && formData.householdSize == null)
    );
  };

  const isNextDisabled = computeNextDisabled();

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
            <div className='mx-auto max-w-lg px-4'>{stepsConfig[step]?.component}</div>
          ) : (
            <ScrollFade>{stepsConfig[step]?.component}</ScrollFade>
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
                {!hideSkip && (
                  <Button variant='tertiary' onClick={skip}>
                    Skip
                  </Button>
                )}
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
