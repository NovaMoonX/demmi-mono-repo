import type { StepProps } from './types';

export function StepWelcome(_props: StepProps) {
  return (
    <div className='flex flex-col items-center gap-4 text-center'>
      <h1 className='text-foreground text-3xl font-bold'>Welcome to Demmi 👋</h1>
      <p className='text-muted-foreground mx-auto max-w-sm text-base'>
        Let's set up your personal cooking space. This takes about 6 minutes.
      </p>
    </div>
  );
}
