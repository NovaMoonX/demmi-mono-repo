import { Badge, Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import type { ToolCallActionCardProps } from './types';
import type { ToolCallResultInfo } from '@lib/ollama/action-types/toolCallAction.types';

function toolDisplayName(name: string): string {
  const result = name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return result;
}

function statusBadge(status: ToolCallResultInfo['status']): { label: string; variant: 'base' | 'primary' | 'destructive' | 'success' | 'warning' } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', variant: 'warning' };
    case 'confirmed':
      return { label: 'Confirmed', variant: 'success' };
    case 'rejected':
      return { label: 'Rejected', variant: 'destructive' };
    case 'executing':
      return { label: 'Running…', variant: 'primary' };
    case 'completed':
      return { label: 'Done', variant: 'success' };
    case 'failed':
      return { label: 'Failed', variant: 'destructive' };
  }
}

export function ToolCallActionCard({
  action,
  onConfirmToolCall,
  onRejectToolCall,
}: ToolCallActionCardProps) {
  return (
    <div className='border-border bg-card/50 mt-3 flex flex-col gap-2 rounded-xl border p-4'>
      <div className='flex items-center gap-2'>
        <span className='text-sm'>🔧</span>
        <p className='text-foreground text-sm font-medium'>
          {action.status === 'calling_tools' ? 'Calling tools…' : 'Tool Results'}
        </p>
      </div>

      {action.toolCalls.map((tc, idx) => {
        const badge = statusBadge(tc.status);
        const needsConfirmation = tc.requiresConfirmation && tc.status === 'pending';

        return (
          <div
            key={`${tc.toolName}-${idx}`}
            className={join(
              'border-border bg-background rounded-lg border p-3',
              needsConfirmation && 'border-warning/50',
            )}
          >
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground font-mono text-xs'>
                  {toolDisplayName(tc.toolName)}
                </span>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
            </div>

            {tc.result && (
              <p className='text-muted-foreground mt-1 text-sm'>
                {tc.result.message}
              </p>
            )}

            {tc.result?.displayType === 'list' && tc.result.data != null && (
              <ToolResultList data={tc.result.data as { items: Array<Record<string, unknown>>; total: number }} />
            )}

            {tc.result?.displayType === 'confirmation' && tc.result.data != null && (
              <ToolConfirmationDetail data={tc.result.data as Record<string, unknown>} />
            )}

            {needsConfirmation && onConfirmToolCall && onRejectToolCall && (
              <div className='mt-2 flex gap-2'>
                <Button
                  size='sm'
                  variant='base'
                  onClick={() => onConfirmToolCall(idx)}
                >
                  Approve
                </Button>
                <Button
                  size='sm'
                  variant='base'
                  onClick={() => onRejectToolCall(idx)}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ToolResultList({ data }: { data: { items: Array<Record<string, unknown>>; total: number } }) {
  if (!data.items || data.items.length === 0) return null;

  const displayItems = data.items.slice(0, 10);
  const hasMore = data.total > 10;

  return (
    <div className='mt-2 max-h-48 overflow-y-auto'>
      <ul className='space-y-1'>
        {displayItems.map((item, idx) => {
          const label = (item.title ?? item.name ?? item.content ?? item.recipeName ?? `Item ${idx + 1}`) as string;
          return (
            <li key={String(item.id ?? idx)} className='text-foreground flex items-center gap-2 text-sm'>
              <span className='text-muted-foreground'>•</span>
              <span>{label}</span>
              {item.category != null && (
                <span className='text-muted-foreground text-xs'>({String(item.category)})</span>
              )}
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <p className='text-muted-foreground mt-1 text-xs'>
          …and {data.total - 10} more
        </p>
      )}
    </div>
  );
}

function ToolConfirmationDetail({ data }: { data: Record<string, unknown> }) {
  const proposedChanges = data.proposedChanges as Record<string, { current: unknown; proposed: unknown }> | undefined;

  if (!proposedChanges) return null;

  return (
    <div className='mt-2 space-y-1'>
      {Object.entries(proposedChanges).map(([key, change]) => (
        <div key={key} className='flex items-center gap-2 text-sm'>
          <span className='text-muted-foreground font-mono text-xs'>{key}:</span>
          <span className='text-destructive line-through'>{String(change.current ?? '—')}</span>
          <span>→</span>
          <span className='text-success'>{String(change.proposed ?? '—')}</span>
        </div>
      ))}
    </div>
  );
}
