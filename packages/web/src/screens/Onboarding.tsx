import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import type { UserProfile } from '@lib/userProfile';
import { useOnboardingStep } from '@hooks/useOnboardingStep';
import {
  StepWelcome,
  StepGoal,
  StepDietary,
  StepCuisines,
  StepHousehold,
} from '@components/onboarding';

const TOTAL_STEPS = 5;

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
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const { visible } = useOnboardingStep(step);

  const next = () => setStep((s) => s + 1);
  const previous = () => setStep((s) => s - 1);
  const skip = () => next();
  const update = (data: Partial<UserProfile>) =>
    setFormData((prev) => ({ ...prev, ...data }));

  const stepProps = { formData, update, next, skip, back: previous };

  const steps = [
    <StepWelcome key='welcome' {...stepProps} />,
    <StepGoal key='goal' {...stepProps} />,
    <StepDietary key='dietary' {...stepProps} />,
    <StepCuisines key='cuisines' {...stepProps} />,
    <StepHousehold key='household' {...stepProps} />,
  ];

  const progressPercent = step === 0 ? 0 : Math.round((step / (TOTAL_STEPS - 1)) * 100);

  const isNextDisabled =
    (step === 1 && !formData.cookingGoal?.length) ||
    (step === 4 && formData.householdSize === null);

  return (
    <div className='bg-background flex h-screen flex-col'>
      {step > 0 && (
        <header className='border-border shrink-0 border-b px-4 py-3'>
          <div className='mx-auto max-w-lg space-y-2'>
            <span className='text-muted-foreground text-xs'>
              Step {step} of {TOTAL_STEPS - 1}
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
          step === 0 ? 'items-center justify-center' : '',
        )}
        style={{ opacity: visible ? 1 : 0 }}
      >
        {step === 0 ? (
          <div className='mx-auto max-w-lg px-4'>{steps[0]}</div>
        ) : (
          <ScrollFade>{steps[step]}</ScrollFade>
        )}
      </div>

      <footer className='border-border shrink-0 border-t px-4 py-3'>
        <div className='mx-auto max-w-lg'>
          {step === 0 ? (
            <div className='flex items-center justify-between gap-3'>
              <Button variant='secondary' onClick={() => navigate('/')}>
                Skip setup
              </Button>
              <Button variant='primary' onClick={next}>
                Let's go
              </Button>
            </div>
          ) : (
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
          )}
        </div>
      </footer>
    </div>
  );
}

export default Onboarding;
