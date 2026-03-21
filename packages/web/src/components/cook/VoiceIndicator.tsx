import { useState, useEffect, useRef } from 'react';
import { Toggle, Label } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { VoiceState } from '@hooks/useCookModeVoice';

interface VoiceIndicatorProps {
  voiceState: VoiceState;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const VOICE_MODE_SEEN_KEY = 'demmi_voice_mode_seen';

export function VoiceIndicator({
  voiceState,
  enabled,
  onToggle,
}: VoiceIndicatorProps) {
  const [showInitialAnimation, setShowInitialAnimation] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [showFirstTimeCommands, setShowFirstTimeCommands] = useState(false);
  const wasEnabledRef = useRef(enabled);

  useEffect(() => {
    const wasEnabled = wasEnabledRef.current;
    wasEnabledRef.current = enabled;

    if (enabled && !wasEnabled) {
      const hasSeenBefore =
        localStorage.getItem(VOICE_MODE_SEEN_KEY) === 'true';

      const enableTimer = setTimeout(() => {
        setShowInitialAnimation(true);
      }, 0);
      const disableTimer = setTimeout(() => {
        setShowInitialAnimation(false);
        if (!hasSeenBefore) {
          setTimeout(() => {
            setShowFirstTimeCommands(true);
            localStorage.setItem(VOICE_MODE_SEEN_KEY, 'true');

            setTimeout(() => {
              setShowFirstTimeCommands(false);
            }, 8000);
          }, 500);
        }
      }, 2000);
      return () => {
        clearTimeout(enableTimer);
        clearTimeout(disableTimer);
      };
    } else if (!enabled && wasEnabled) {
      const timer = setTimeout(() => {
        setShowInitialAnimation(false);
        setShowFirstTimeCommands(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  if (voiceState === 'unsupported') return null;

  return (
    <>
      {/* Voice Mode Toggle - Top Left */}
      <div className='absolute top-3 left-3 z-10'>
        <div className='bg-background/95 border-border flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm'>
          <Label htmlFor='voice-toggle' className='text-xs'>
            🎤 Voice
          </Label>
          <Toggle
            id='voice-toggle'
            checked={enabled}
            onCheckedChange={onToggle}
            size='sm'
          />
        </div>
      </div>

      {/* Wake Word Notice - Bottom (above step indicators) */}
      {enabled && voiceState !== 'listening' && (
        <div className='pointer-events-auto absolute bottom-16 left-1/2 -translate-x-1/2'>
          {/* Commands Tooltip - Above Wake Word Notice */}
          <div
            className={join(
              'bg-background border-border absolute bottom-full left-1/2 mb-2 w-72 -translate-x-1/2 rounded-lg border p-4 shadow-xl transition-all duration-200',
              showCommands || showFirstTimeCommands
                ? 'pointer-events-auto scale-100 opacity-100 translate-y-0'
                : 'pointer-events-none scale-95 opacity-0 translate-y-2',
            )}
            style={{ transformOrigin: 'bottom center' }}
          >
            <p className='text-foreground mb-3 text-sm font-semibold'>
              Voice Commands
            </p>
            <div className='text-muted-foreground space-y-2 text-xs'>
              <div>
                <p className='text-foreground font-medium'>Wake word:</p>
                <p className='ml-2'>"Hey Demmi"</p>
              </div>
              <div>
                <p className='text-foreground font-medium'>Navigation:</p>
                <p className='ml-2'>"Next step" · "Previous step"</p>
                <p className='ml-2'>"Go to step [number]"</p>
                <p className='ml-2'>"Last step" · "Final step"</p>
              </div>
              <div>
                <p className='text-foreground font-medium'>Ingredients:</p>
                <p className='ml-2'>
                  "Show ingredients" · "Close ingredients"
                </p>
              </div>
              <div>
                <p className='text-foreground font-medium'>Servings:</p>
                <p className='ml-2'>"More servings" · "Less servings"</p>
                <p className='ml-2'>"Four servings" · "Six servings"</p>
              </div>
              <div>
                <p className='text-foreground font-medium'>Other:</p>
                <p className='ml-2'>"Cancel" · "Nevermind"</p>
              </div>
              <div>
                <p className='text-foreground font-medium'>Exit:</p>
                <p className='ml-2'>"Exit" · "Done cooking"</p>
              </div>
            </div>
            {showFirstTimeCommands && (
              <p className='text-muted-foreground border-border mt-3 border-t pt-3 text-xs italic'>
                💡 Hover over this indicator anytime to view commands
              </p>
            )}
          </div>

          {/* Wake Word Notice */}
          <div
            className={join(
              'cursor-help rounded-full px-4 py-2 text-xs whitespace-nowrap transition-all duration-500',
              'backdrop-blur-sm',
              showInitialAnimation
                ? 'bg-accent/90 text-accent-foreground animate-pulse'
                : 'bg-muted/80 text-muted-foreground',
            )}
            onMouseEnter={() => setShowCommands(true)}
            onMouseLeave={() => {
              setShowCommands(false);
              setShowFirstTimeCommands(false);
            }}
            aria-hidden='true'
          >
            <span className='mr-1.5'>🎤</span>
            <span>Say "Hey Demmi"</span>
          </div>
        </div>
      )}

      <div
        className={join(
          'pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-6 transition-opacity duration-300',
          voiceState === 'listening' ? 'opacity-100' : 'opacity-0',
        )}
        aria-live='polite'
        aria-atomic='true'
      >
        <div className='border-primary/20 bg-background/95 mx-4 w-full max-w-sm rounded-2xl border px-6 py-4 shadow-xl backdrop-blur-sm'>
          <div className='flex items-center gap-3'>
            <div className='relative flex shrink-0 items-center justify-center'>
              <span className='bg-primary/30 absolute inline-flex h-10 w-10 animate-ping rounded-full' />
              <span className='bg-primary relative flex h-10 w-10 items-center justify-center rounded-full text-lg'>
                🎤
              </span>
            </div>
            <div className='flex-1'>
              <p className='text-foreground text-sm font-semibold'>
                Listening…
              </p>
              <p className='text-muted-foreground text-xs'>Say a command</p>
            </div>
          </div>
          <div className='text-muted-foreground mt-3 space-y-1 text-xs'>
            <p>
              "Next step"
              <span aria-hidden='true'> · </span>
              "Previous step"
            </p>
            <p>
              "Show ingredients"
              <span aria-hidden='true'> · </span>
              "Four servings"
            </p>
            <p>
              "Go to step 4"
              <span aria-hidden='true'> · </span>
              "Last step"
            </p>
            <p>
              "Cancel"
              <span aria-hidden='true'> · </span>
              "Exit"
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
