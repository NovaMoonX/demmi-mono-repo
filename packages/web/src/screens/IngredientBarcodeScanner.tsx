import { join } from '@moondreamsdev/dreamer-ui/utils';
import { Callout } from '@moondreamsdev/dreamer-ui/components';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBarcodeScanner } from '@hooks/useBarcodeScanner';
import { useLazyGetProductByBarcodeQuery } from '@store/api/openFoodFactsApi';

export function IngredientBarcodeScanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRecipePath =
    (location.state as { fromRecipePath?: string } | null)?.fromRecipePath ?? null;

  const { isScanning, lastResult, error, videoRef, startScan, stopScan } =
    useBarcodeScanner();

  const [triggerLookup] = useLazyGetProductByBarcodeQuery();

  useEffect(() => {
    startScan();
    return () => {
      stopScan();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lastResult == null) return;

    void triggerLookup(lastResult, true);

    navigate('/ingredients/new/barcode-entry', {
      state: {
        fromRecipePath,
        scannedBarcode: lastResult,
      },
    });
  }, [lastResult, triggerLookup, navigate, fromRecipePath]);

  return (
    <div className='mx-auto mt-10 max-w-2xl p-6 md:mt-0'>
      <div className='mb-6'>
        <Link
          to={fromRecipePath ?? '/ingredients'}
          state={fromRecipePath ? { fromRecipePath } : undefined}
          className='text-muted-foreground hover:text-foreground mb-4 inline-block text-sm'
        >
          {fromRecipePath ? '← Back to Recipe' : '← Back to Ingredients'}
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
            !isScanning && 'hidden',
          )}
        />

        {error === 'permission-denied' && (
          <div className='flex flex-col items-center gap-3 p-8 text-center'>
            <span className='text-5xl'>🚫</span>
            <p className='text-muted-foreground text-sm'>
              No camera access
            </p>
          </div>
        )}

        {!isScanning && error == null && lastResult == null && (
          <div className='flex flex-col items-center gap-3 p-8 text-center'>
            <span className='text-5xl'>📷</span>
            <p className='text-muted-foreground text-sm'>
              Waiting for camera permission…
            </p>
          </div>
        )}
      </div>

      {error === 'permission-denied' && (
        <div className='mt-4'>
          <Callout
            variant='destructive'
            title='Camera access denied'
            description='Please allow camera access in your browser settings, then try again.'
          />
        </div>
      )}

      {lastResult != null && (
        <p className='text-foreground mt-4 text-center text-sm font-semibold'>
          Barcode detected: {lastResult}
        </p>
      )}
    </div>
  );
}

export default IngredientBarcodeScanner;
