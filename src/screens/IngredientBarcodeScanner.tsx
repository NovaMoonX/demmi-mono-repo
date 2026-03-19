import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type CameraPermission = 'prompt' | 'granted' | 'denied';

export function IngredientBarcodeScanner() {
  const location = useLocation();
  const fromMealPath =
    (location.state as { fromMealPath?: string } | null)?.fromMealPath ?? null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permission, setPermission] = useState<CameraPermission>('prompt');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermission('granted');
    } catch {
      setPermission('denied');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startCamera();

    // Listen for camera permission changes
    navigator.permissions
      .query({ name: 'camera' })
      .then((status) => {
        status.onchange = () => {
          if (status.state === 'granted') void startCamera();
          if (status.state === 'denied') setPermission('denied');
        };
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className='mx-auto mt-10 max-w-2xl p-6 md:mt-0'>
      <div className='mb-6'>
        <Link
          to={fromMealPath ?? '/ingredients'}
          state={fromMealPath ? { fromMealPath } : undefined}
          className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
        >
          {fromMealPath ? '← Back to Meal' : '← Back to Ingredients'}
        </Link>
        <h1 className='text-foreground mb-2 text-4xl font-bold'>
          Scan Barcode
        </h1>
        <p className='text-muted-foreground'>
          Point your camera at a product barcode to get started.
        </p>
      </div>

      <div className='bg-muted flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border'>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={join(
            'h-full w-full object-cover',
            permission !== 'granted' && 'hidden',
          )}
        />

        {permission === 'denied' && (
          <div className='flex flex-col items-center gap-4 p-8 text-center'>
            <span className='text-5xl'>📷</span>
            <p className='text-foreground font-semibold'>
              Camera access denied
            </p>
            <p className='text-muted-foreground text-sm'>
              Please allow camera access in your browser settings, then try
              again.
            </p>
          </div>
        )}

        {permission === 'prompt' && (
          <div className='flex flex-col items-center gap-3 p-8 text-center'>
            <span className='text-5xl'>📷</span>
            <p className='text-muted-foreground text-sm'>
              Waiting for camera permission…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IngredientBarcodeScanner;
