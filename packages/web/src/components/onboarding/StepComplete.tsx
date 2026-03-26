import { Button } from '@moondreamsdev/dreamer-ui/components';
import type { StepProps } from './types';

export function StepComplete({ next }: StepProps) {
  return (
    <div className='flex flex-col items-center gap-8 py-8 text-center'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-3xl font-bold'>You're all set! 🎉</h2>
        <p className='text-muted-foreground text-sm'>
          Everything is ready. Here's what you can do with Demmi:
        </p>
      </div>

      <ul className='text-foreground space-y-2 text-left text-sm'>
        <li className='flex items-center gap-2'>
          <span>📅</span> Plan your meals
        </li>
        <li className='flex items-center gap-2'>
          <span>🤖</span> Cook with Demi
        </li>
        <li className='flex items-center gap-2'>
          <span>🥦</span> Keep your pantry stocked
        </li>
      </ul>

      <Button variant='primary' onClick={next} type='button'>
        Go to my kitchen →
      </Button>
    </div>
  );
}
