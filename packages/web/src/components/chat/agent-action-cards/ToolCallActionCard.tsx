import { Badge, Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { Link } from 'react-router-dom';
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

function getItemLink(toolName: string, item: Record<string, unknown>): string | null {
  if (toolName === 'search_recipes' || toolName === 'get_recipe' || toolName === 'create_recipe') {
    if (item.id) return `/recipes/${item.id}?from=chat`;
  }
  if (toolName === 'search_ingredients' || toolName === 'get_ingredient' || toolName === 'create_ingredient') {
    if (item.id) return `/ingredients/${item.id}?from=chat`;
  }
  if (toolName === 'get_meal_plan' || toolName === 'plan_recipe') {
    return '/calendar?from=chat';
  }
  if (toolName === 'get_shopping_list' || toolName === 'add_to_shopping_list') {
    return '/shopping-list?from=chat';
  }
  return null;
}

function getToolActionLink(toolName: string): { path: string; label: string } | null {
  if (toolName === 'get_shopping_list' || toolName === 'add_to_shopping_list' ||
    toolName === 'check_shopping_items' || toolName === 'remove_shopping_items' ||
    toolName === 'clear_checked_items') {
    return { path: '/shopping-list?from=chat', label: 'View Shopping List →' };
  }
  if (toolName === 'get_meal_plan' || toolName === 'plan_recipe' ||
    toolName === 'update_planned_recipe' || toolName === 'remove_planned_recipe') {
    return { path: '/calendar?from=chat', label: 'View Calendar →' };
  }
  return null;
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
        const actionLink = tc.status === 'completed' ? getToolActionLink(tc.toolName) : null;

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

            {tc.status === 'executing' && (
              <div className='mt-1 flex items-center gap-1.5'>
                <span className='text-primary animate-pulse text-xs'>●</span>
                <span className='text-muted-foreground text-xs'>Processing…</span>
              </div>
            )}

            {tc.result && (
              <p className='text-muted-foreground mt-1 text-sm'>
                {tc.result.message}
              </p>
            )}

            {tc.result?.displayType === 'list' && tc.result.data != null && (
              <ToolResultList
                toolName={tc.toolName}
                data={tc.result.data as { items: Array<Record<string, unknown>>; total: number }}
              />
            )}

            {tc.result?.displayType === 'success' && tc.result.data != null && (
              <ToolSuccessLink toolName={tc.toolName} data={tc.result.data as Record<string, unknown>} />
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

            {actionLink && !needsConfirmation && (
              <div className='mt-2'>
                <Link
                  to={actionLink.path}
                  className='text-primary hover:text-primary/80 text-xs font-medium'
                >
                  {actionLink.label}
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ToolResultList({ toolName, data }: { toolName: string; data: { items: Array<Record<string, unknown>>; total: number } }) {
  if (!data.items || data.items.length === 0) return null;

  const displayItems = data.items.slice(0, 10);
  const hasMore = data.total > 10;

  return (
    <div className='mt-2 max-h-48 overflow-y-auto'>
      <ul className='space-y-1'>
        {displayItems.map((item, idx) => {
          const label = (item.title ?? item.name ?? item.content ?? item.recipeName ?? `Item ${idx + 1}`) as string;
          const link = getItemLink(toolName, item);

          return (
            <li key={String(item.id ?? idx)} className='text-foreground flex items-center gap-2 text-sm'>
              <span className='text-muted-foreground'>•</span>
              {link ? (
                <Link to={link} className='text-primary hover:text-primary/80 hover:underline'>
                  {label}
                </Link>
              ) : (
                <span>{label}</span>
              )}
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

function ToolSuccessLink({ toolName, data }: { toolName: string; data: Record<string, unknown> }) {
  const link = getItemLink(toolName, data);
  if (!link) return null;

  const label = (data.title ?? data.name) as string | undefined;
  if (!label) return null;

  return (
    <div className='mt-1'>
      <Link to={link} className='text-primary hover:text-primary/80 text-xs font-medium hover:underline'>
        View {label} →
      </Link>
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
