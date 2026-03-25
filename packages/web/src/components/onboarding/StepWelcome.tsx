import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import type { StepProps } from './types';

export function StepWelcome({ next }: StepProps) {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center gap-6 text-center'>
      <div className='space-y-3'>
        <h1 className='text-foreground text-3xl font-bold'>Welcome to Demmi 👋</h1>
        <p className='text-muted-foreground mx-auto max-w-sm text-base'>
          Let's set up your personal cooking space. This takes about 6 minutes.
        </p>
      </div>
      <div className='flex flex-col gap-3 sm:flex-row'>
        <Button variant='primary' onClick={next}>
          Let's go
        </Button>
        <Button variant='secondary' onClick={() => navigate('/')}>
          Skip setup
        </Button>
      </div>
    </div>
  );
}
