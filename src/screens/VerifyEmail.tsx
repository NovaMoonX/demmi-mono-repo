import { useAuth } from '@hooks/useAuth';
import { auth as firebaseAuth } from '@lib/firebase/firebase.config';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function VerifyEmail() {
  const { user, logOut, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkVerification = async () => {
      const currentUser = firebaseAuth.currentUser;

      if (!currentUser) {
        return;
      }

      await currentUser.reload();

      if (!mounted) {
        return;
      }

      if (currentUser.emailVerified) {
        const redirectResult = navigate('/chat');
        return redirectResult;
      }

      return undefined;
    };

    const runInitialCheck = async () => {
      const result = await checkVerification();
      return result;
    };

    void runInitialCheck();

    const intervalId = window.setInterval(() => {
      void checkVerification();
    }, 5000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [navigate]);

  const handleResendEmail = async () => {
    setSending(true);

    const result = await resendVerificationEmail();

    if (result.error) {
      addToast({
        title: 'Error',
        description: result.error.message,
        type: 'destructive',
      });
    } else {
      addToast({
        title: 'Email Sent',
        description:
          'Verification email has been sent. Please check your inbox.',
        type: 'success',
      });
    }

    setSending(false);
  };

  const handleLogOut = async () => {
    await logOut();
  };

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <div className='bg-card w-full max-w-md rounded-lg p-8 shadow-lg'>
        <div className='mb-6 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900'>
            <svg
              className='h-8 w-8 text-orange-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
          </div>
          <h1 className='text-foreground mb-2 text-2xl font-bold'>
            Verify Your Email
          </h1>
          <p className='text-muted-foreground'>
            We've sent a verification email to:
          </p>
          <p className='text-foreground mt-2 font-semibold'>{user?.email}</p>
        </div>

        <div className='border-border bg-muted/50 mb-6 space-y-3 rounded-lg border p-4'>
          <p className='text-muted-foreground text-sm'>
            Please check your inbox and click the verification link to continue.
          </p>
          <p className='text-muted-foreground text-sm'>
            We’ll automatically check for verification and send you to the app.
          </p>
        </div>

        <div className='space-y-3'>
          <Button
            onClick={handleResendEmail}
            disabled={sending}
            variant='secondary'
            className='w-full'
          >
            {sending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
          <Button onClick={handleLogOut} variant='outline' className='w-full'>
            Sign Out
          </Button>
        </div>

        <p className='text-muted-foreground mt-6 text-center text-xs'>
          Didn't receive the email? Check your spam folder or click resend.
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
