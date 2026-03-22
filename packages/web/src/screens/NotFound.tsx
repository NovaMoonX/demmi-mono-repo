import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';

export function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAuthenticated = !!user;

  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <Button
          onClick={handleGoBack}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isAuthenticated ? 'Return to App' : 'Go to Home'}
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
