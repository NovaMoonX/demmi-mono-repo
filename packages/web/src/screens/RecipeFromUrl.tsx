import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Label } from '@moondreamsdev/dreamer-ui/components';

export function RecipeFromUrl() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  const handleContinue = () => {
    navigate('/recipes/new', { state: { sourceUrl: url } });
  };

  return (
    <div className='mx-auto mt-10 max-w-2xl p-6 md:mt-0'>
      <div className='mb-8'>
        <Link
          to='/recipes'
          className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
        >
          ← Back to Recipes
        </Link>
        <h1 className='text-foreground mb-2 text-4xl font-bold'>Import from URL</h1>
        <p className='text-muted-foreground'>
          Found this recipe online? Drop the link below and we'll get it ready for you.
        </p>
      </div>

      <div className='flex flex-col gap-6'>
        <div>
          <Label htmlFor='recipe-url'>Recipe URL</Label>
          <Input
            id='recipe-url'
            type='url'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='https://example.com/my-favorite-recipe'
          />
        </div>

        {url.trim() !== '' && (
          <div className='border-border bg-muted/40 rounded-xl border p-4'>
            <p className='text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide'>
              Preview
            </p>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-accent hover:text-accent/80 break-all text-sm underline underline-offset-4'
            >
              {url}
            </a>
          </div>
        )}

        <div className='flex gap-3'>
          <Button
            variant='primary'
            className='flex-1'
            onClick={handleContinue}
            disabled={url.trim() === ''}
          >
            Continue
          </Button>
          <Button
            variant='secondary'
            className='flex-1'
            onClick={() => navigate('/recipes')}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RecipeFromUrl;
