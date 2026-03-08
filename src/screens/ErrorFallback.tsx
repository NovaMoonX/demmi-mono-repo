import { useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';

export function ErrorFallback() {
  const navigate = useNavigate();
  const error = useRouteError();
  const { user } = useAuth();

  const isAuthenticated = !!user;

  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const errorMessage = error instanceof Error ? error.message : 'An error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">Error</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Something Went Wrong
          </h2>
          <p className="text-muted-foreground">
            Sorry, we encountered an unexpected error.
          </p>
        </div>

        {Boolean(error) && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-mono">
              {errorMessage}
            </p>
          </div>
        )}

        <Button
          onClick={handleGoBack}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isAuthenticated ? 'Go to App' : 'Go to Home'}
        </Button>
      </div>
    </div>
  );
}

export default ErrorFallback;