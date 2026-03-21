import { join } from '@moondreamsdev/dreamer-ui/utils';

interface ChatHistoryToggleIconProps {
  className?: string | null;
}

export function ChatHistoryToggleIcon({ className }: ChatHistoryToggleIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={join('size-4 text-foreground', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <line x1="7" y1="7" x2="7" y2="13" />
      <line x1="10" y1="7" x2="14" y2="7" />
      <line x1="10" y1="10" x2="14" y2="10" />
      <line x1="10" y1="13" x2="14" y2="13" />
    </svg>
  );
}
