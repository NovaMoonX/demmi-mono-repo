import { Button, Callout } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';

interface BarcodeScannerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isScanning: boolean;
  error: 'permission-denied' | 'no-camera' | 'scanner-unavailable' | null;
  onCancel: () => void;
}

export function BarcodeScanner({
  videoRef,
  isScanning,
  error,
  onCancel,
}: BarcodeScannerProps) {
  return (
    <div className='space-y-4'>
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

        {!isScanning && error == null && (
          <div className='flex flex-col items-center gap-3 p-8 text-center'>
            <span className='text-5xl'>📷</span>
            <p className='text-muted-foreground text-sm'>
              Waiting for camera…
            </p>
          </div>
        )}
      </div>

      {error === 'permission-denied' && (
        <Callout
          variant='destructive'
          title='Camera access denied'
          description='Please allow camera access in your browser settings, then try again.'
        />
      )}

      {error === 'scanner-unavailable' && (
        <Callout
          variant='warning'
          title='Scanner not available'
          description='Scanner not available — please enter the barcode manually.'
        />
      )}

      {isScanning && (
        <p className='text-muted-foreground text-center text-sm'>
          Point your camera at a barcode…
        </p>
      )}

      <Button variant='secondary' onClick={onCancel} className='w-full'>
        Cancel
      </Button>
    </div>
  );
}
