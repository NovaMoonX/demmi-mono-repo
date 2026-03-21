import { join } from '@moondreamsdev/dreamer-ui/utils';

type GeneratingIndicatorProps = {
  className?: string;
  dotClassName?: string;
};

export function GeneratingIndicator({
  className,
  dotClassName,
}: GeneratingIndicatorProps) {
  return (
    <div className={join('text-muted-foreground flex items-center gap-1 text-xs', className)}>
      <span className={join('animate-bounce', dotClassName)}>●</span>
      <span
        className={join('animate-bounce [animation-delay:0.15s]', dotClassName)}
      >
        ●
      </span>
      <span
        className={join('animate-bounce [animation-delay:0.3s]', dotClassName)}
      >
        ●
      </span>
    </div>
  );
}
