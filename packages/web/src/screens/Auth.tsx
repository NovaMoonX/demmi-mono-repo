import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm, Button } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { startDemoSession } from '@store/slices/demoSlice';

export function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth();
  const dispatch = useAppDispatch();
  const isDemoActive = useAppSelector((state) => state.demo.isActive);
  const [errorMessage, setErrorMessage] = useState('');

  // If user is already authenticated or demo is active, redirect to chat
  // since there's no reason to show the auth screen
  useEffect(() => {
    if (!loading && (user || isDemoActive)) {
      navigate('/chat');
    }
  }, [loading, user, isDemoActive, navigate]);

  const handleEmailSubmit = async ({
    data,
    action,
  }: {
    data: { email: string; password: string };
    action: 'login' | 'sign up';
  }) => {
    setErrorMessage('');

    const result =
      action === 'login'
        ? await signIn(data.email, data.password)
        : await signUp(data.email, data.password);

    if (result.error) {
      const errorResult = { error: { message: result.error.message } };
      setErrorMessage(errorResult.error.message);
      return errorResult;
    }

    const successResult = {};
    return successResult;
  };

  const handleMethodClick = async (method: string) => {
    setErrorMessage('');

    if (method !== 'google') {
      const errorResult = { error: { message: 'Unsupported sign-in method' } };
      setErrorMessage(errorResult.error.message);
      return errorResult;
    }

    const result = await signInWithGoogle();

    if (result.error) {
      const errorResult = { error: { message: result.error.message } };
      setErrorMessage(errorResult.error.message);
      return errorResult;
    }

    const successResult = {};
    return successResult;
  };

  const handleSuccess = () => {
    // Navigation will be handled by ProtectedRoute
    navigate('/chat');
  };

  const handleTryDemo = async () => {
    await dispatch(startDemoSession());
    navigate('/chat');
  };

  const validatePassword = (password: string): string | undefined => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return undefined;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="-translate-y-10 mb-10">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </Button>
        </div>
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Welcome to Demmi
          </h1>
          <p className="text-muted-foreground">
            Sign in or create an account to start cooking
          </p>
        </div>
        <AuthForm
          methods={['email', 'google']}
          action="both"
          onEmailSubmit={handleEmailSubmit}
          onMethodClick={handleMethodClick}
          onSuccess={handleSuccess}
          errorMessage={errorMessage}
          validatePassword={validatePassword}
          className="rounded-lg bg-card p-6 shadow-lg"
        />
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Just want to explore?
          </p>
          <button
            onClick={handleTryDemo}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            🎭 Try Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
