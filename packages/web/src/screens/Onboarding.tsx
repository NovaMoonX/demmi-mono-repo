import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
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

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const { visible } = useOnboardingStep(step);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);
  const skip = () => next();
  const update = (data: Partial<UserProfile>) =>
    setFormData((prev) => ({ ...prev, ...data }));

  const stepProps = { formData, update, next, skip, back };

  const steps = [
    <StepWelcome key='welcome' {...stepProps} />,
    <StepGoal key='goal' {...stepProps} />,
    <StepDietary key='dietary' {...stepProps} />,
    <StepCuisines key='cuisines' {...stepProps} />,
    <StepHousehold key='household' {...stepProps} />,
  ];

  const progressPercent = step === 0 ? 0 : Math.round((step / (TOTAL_STEPS - 1)) * 100);

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {step > 0 && (
        <header className='border-border border-b px-4 py-3'>
          <div className='mx-auto max-w-lg space-y-2'>
            <div className='text-muted-foreground flex items-center justify-between text-xs'>
              <span>
                Step {step} of {TOTAL_STEPS - 1}
              </span>
              <Button variant='secondary' size='sm' onClick={() => navigate('/')}>
                Skip setup
              </Button>
            </div>
            <div className='bg-muted h-1.5 w-full overflow-hidden rounded-full'>
              <div
                className='bg-primary h-full rounded-full transition-all duration-300'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>
      )}

      <main className='flex flex-1 items-center justify-center p-6'>
        <div
          className='w-full max-w-lg transition-opacity duration-300'
          style={{ opacity: visible ? 1 : 0 }}
        >
          {steps[step]}
        </div>
      </main>

      {step > 0 && (
        <footer className='border-border border-t px-4 py-3'>
          <div className='mx-auto max-w-lg'>
            <Button variant='secondary' size='sm' onClick={back} disabled={step <= 1}>
              ← Back
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

export default Onboarding;
