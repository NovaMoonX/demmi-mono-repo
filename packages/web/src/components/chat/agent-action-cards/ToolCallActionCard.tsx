import { Badge, Button, Card } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { Link } from 'react-router-dom';
import type { ToolCallActionCardProps } from './types';
import type { ToolCallResultInfo } from '@lib/ollama/action-types/toolCallAction.types';
import type { RecipeCategory } from '@lib/recipes';
import type { IngredientType } from '@lib/ingredients';
import {
  RECIPE_CATEGORY_COLORS,
  RECIPE_CATEGORY_EMOJIS,
  RECIPE_CUISINE_EMOJIS,
  RECIPE_CUISINE_COLORS,
  capitalizeCuisine,
  getCuisineColorClass,
} from '@lib/recipes';
import {
  INGREDIENT_TYPE_EMOJIS,
  INGREDIENT_TYPE_COLORS,
} from '@lib/ingredients';

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

const RECIPE_TOOLS = ['search_recipes', 'get_recipe', 'create_recipe'];
const INGREDIENT_TOOLS = ['search_ingredients', 'get_ingredient', 'create_ingredient'];
const CALENDAR_TOOLS = ['get_meal_plan', 'plan_recipe', 'update_planned_recipe', 'remove_planned_recipe'];
const SHOPPING_LIST_TOOLS = ['get_shopping_list', 'add_to_shopping_list', 'check_shopping_items', 'remove_shopping_items', 'clear_checked_items'];

export function ToolCallActionCard({
  action,
  onConfirmToolCall,
  onRejectToolCall,
}: ToolCallActionCardProps) {
  const isExecuting = action.status === 'calling_tools';

  return (
    <div className='mt-3 flex flex-col gap-2'>
      {action.toolCalls.map((tc, idx) => {
        const badge = statusBadge(tc.status);
        const needsConfirmation = tc.requiresConfirmation && tc.status === 'pending';
        const isCompleted = tc.status === 'completed';
        const hasResult = tc.result != null && isCompleted;

        return (
          <div key={`${tc.toolName}-${idx}`} className='flex flex-col gap-2'>
            <div
              className={join(
                'border-border bg-card/50 rounded-xl border p-3',
                needsConfirmation && 'border-warning/50',
              )}
            >
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm'>🔧</span>
                  <span className='text-foreground text-sm font-medium'>
                    {toolDisplayName(tc.toolName)}
                  </span>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              </div>

              {tc.status === 'executing' && (
                <div className='mt-2 flex items-center gap-1.5'>
                  <span className='text-primary animate-pulse text-xs'>●</span>
                  <span className='text-muted-foreground text-xs'>Processing…</span>
                </div>
              )}

              {tc.result && !hasResult && !needsConfirmation && (
                <p className='text-muted-foreground mt-1 text-sm'>
                  {tc.result.message}
                </p>
              )}

              {needsConfirmation && tc.result && (
                <ToolConfirmationDetail data={tc.result.data as Record<string, unknown>} message={tc.result.message} />
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

            {hasResult && (
              <ToolResultCard toolName={tc.toolName} result={tc.result!} />
            )}
          </div>
        );
      })}

      {isExecuting && (
        <div className='flex items-center gap-1.5 px-1'>
          <span className='text-primary animate-pulse text-xs'>●</span>
          <span className='text-muted-foreground text-xs'>Working…</span>
        </div>
      )}
    </div>
  );
}

function ToolResultCard({ toolName, result }: { toolName: string; result: NonNullable<ToolCallResultInfo['result']> }) {
  if (RECIPE_TOOLS.includes(toolName)) {
    return <RecipeResultCard toolName={toolName} result={result} />;
  }
  if (INGREDIENT_TOOLS.includes(toolName)) {
    return <IngredientResultCard toolName={toolName} result={result} />;
  }
  if (SHOPPING_LIST_TOOLS.includes(toolName)) {
    return <ShoppingListResultCard toolName={toolName} result={result} />;
  }
  if (CALENDAR_TOOLS.includes(toolName)) {
    return <CalendarResultCard toolName={toolName} result={result} />;
  }
  return <GenericResultCard result={result} />;
}

interface ListData {
  items: Array<Record<string, unknown>>;
  total: number;
}

function RecipeResultCard({ result }: { toolName: string; result: NonNullable<ToolCallResultInfo['result']> }) {
  if (result.displayType === 'list') {
    const data = result.data as ListData | null;
    if (!data?.items || data.items.length === 0) {
      return (
        <Card className='overflow-hidden'>
          <div className='flex items-center gap-3 p-4'>
            <span className='text-2xl'>📋</span>
            <p className='text-muted-foreground text-sm'>{result.message}</p>
          </div>
        </Card>
      );
    }
    return (
      <Card className='overflow-hidden'>
        <div className='flex flex-col gap-2 p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
              Recipes ({data.total})
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            {data.items.slice(0, 10).map((item, idx) => {
              const category = item.category as RecipeCategory | undefined;
              const cuisine = item.cuisine as string | undefined;
              const totalTime = (Number(item.prepTime) || 0) + (Number(item.cookTime) || 0);
              return (
                <Link
                  key={String(item.id ?? idx)}
                  to={`/recipes/${item.id}?from=chat`}
                  className='border-border hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors'
                >
                  <span className='shrink-0 text-xl'>
                    {category ? (RECIPE_CATEGORY_EMOJIS[category] ?? '🍽️') : '🍽️'}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-foreground text-sm font-medium'>
                      {String(item.title ?? `Recipe ${idx + 1}`)}
                    </p>
                    <div className='mt-1 flex flex-wrap items-center gap-1.5'>
                      {category && (
                        <Badge
                          variant='base'
                          className={join('text-xs capitalize', RECIPE_CATEGORY_COLORS[category])}
                        >
                          {category}
                        </Badge>
                      )}
                      {cuisine && (
                        <Badge
                          variant='base'
                          className={join('text-xs', getCuisineColorClass(cuisine, RECIPE_CUISINE_COLORS))}
                        >
                          {RECIPE_CUISINE_EMOJIS[cuisine] ?? '🍽️'} {capitalizeCuisine(cuisine)}
                        </Badge>
                      )}
                      {totalTime > 0 && (
                        <span className='text-muted-foreground text-xs'>⏱ {totalTime}m</span>
                      )}
                      {item.servingSize != null && (
                        <span className='text-muted-foreground text-xs'>
                          🍽 {String(item.servingSize)} {Number(item.servingSize) === 1 ? 'serving' : 'servings'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className='text-muted-foreground text-xs'>→</span>
                </Link>
              );
            })}
          </div>
          {data.total > 10 && (
            <p className='text-muted-foreground text-xs'>
              …and {data.total - 10} more
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (result.displayType === 'success' && result.data != null) {
    const data = result.data as Record<string, unknown>;
    const title = String(data.title ?? '');
    const category = data.category as RecipeCategory | undefined;
    const cuisine = data.cuisine as string | undefined;
    const totalTime = (Number(data.prepTime) || 0) + (Number(data.cookTime) || 0);
    const instructions = data.instructions as string[] | undefined;

    return (
      <Card className='overflow-hidden'>
        <div className='flex flex-col gap-3 p-4'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <Badge variant='success'>Created</Badge>
              </div>
              <h4 className='text-foreground mt-1 text-base font-semibold'>{title}</h4>
              {String(data.description ?? '') !== '' && (
                <p className='text-muted-foreground mt-0.5 line-clamp-2 text-sm'>
                  {String(data.description)}
                </p>
              )}
            </div>
            <span className='shrink-0 text-2xl'>
              {category ? (RECIPE_CATEGORY_EMOJIS[category] ?? '🍽️') : '🍽️'}
            </span>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {category && (
              <Badge variant='base' className={join('capitalize', RECIPE_CATEGORY_COLORS[category])}>
                {category}
              </Badge>
            )}
            {cuisine && (
              <Badge variant='base' className={join(getCuisineColorClass(cuisine, RECIPE_CUISINE_COLORS))}>
                {RECIPE_CUISINE_EMOJIS[cuisine] ?? '🍽️'} {capitalizeCuisine(cuisine)}
              </Badge>
            )}
            {totalTime > 0 && (
              <span className='text-muted-foreground text-xs'>⏱ {totalTime}m total</span>
            )}
            {data.servingSize != null && (
              <span className='text-muted-foreground text-xs'>
                {String(data.servingSize)} {Number(data.servingSize) === 1 ? 'serving' : 'servings'}
              </span>
            )}
          </div>
          {instructions && instructions.length > 0 && (
            <p className='text-muted-foreground text-xs'>
              {instructions.length} instruction {instructions.length === 1 ? 'step' : 'steps'}
            </p>
          )}
          {String(data.id ?? '') !== '' && (
            <Link
              to={`/recipes/${String(data.id)}?from=chat`}
              className='text-primary hover:text-primary/80 text-sm font-medium'
            >
              View Recipe →
            </Link>
          )}
        </div>
      </Card>
    );
  }

  return <GenericResultCard result={result} />;
}

function IngredientResultCard({ result }: { toolName: string; result: NonNullable<ToolCallResultInfo['result']> }) {
  if (result.displayType === 'list') {
    const data = result.data as ListData | null;
    if (!data?.items || data.items.length === 0) {
      return (
        <Card className='overflow-hidden'>
          <div className='flex items-center gap-3 p-4'>
            <span className='text-2xl'>🥬</span>
            <p className='text-muted-foreground text-sm'>{result.message}</p>
          </div>
        </Card>
      );
    }
    return (
      <Card className='overflow-hidden'>
        <div className='flex flex-col gap-2 p-4'>
          <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
            Ingredients ({data.total})
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {data.items.slice(0, 20).map((item, idx) => {
              const type = item.type as IngredientType | undefined;
              const emoji = type ? (INGREDIENT_TYPE_EMOJIS[type] ?? '📦') : '📦';
              const colorClass = type ? (INGREDIENT_TYPE_COLORS[type] ?? '') : '';
              const amount = item.currentAmount != null ? Number(item.currentAmount) : null;
              const unit = item.unit as string | undefined;
              const otherUnit = item.otherUnit as string | undefined;
              const displayUnit = unit === 'other' ? (otherUnit ?? unit) : unit;

              return (
                <Link
                  key={String(item.id ?? idx)}
                  to={`/ingredients/${String(item.id)}?from=chat`}
                  className={join(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
                    colorClass || 'bg-muted text-muted-foreground',
                    'hover:opacity-80',
                  )}
                >
                  <span>{emoji}</span>
                  <span className='font-medium'>{String(item.name ?? `Item ${idx + 1}`)}</span>
                  {amount != null && amount > 0 && displayUnit && (
                    <span className='opacity-70'>
                      {amount} {displayUnit}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          {data.total > 20 && (
            <p className='text-muted-foreground text-xs'>
              …and {data.total - 20} more
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (result.displayType === 'success' && result.data != null) {
    const data = result.data as Record<string, unknown>;
    const type = data.type as IngredientType | undefined;
    const emoji = type ? (INGREDIENT_TYPE_EMOJIS[type] ?? '📦') : '📦';

    return (
      <Card className='overflow-hidden'>
        <div className='flex items-center gap-3 p-4'>
          <span className='text-2xl'>{emoji}</span>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <Badge variant='success'>Added to Pantry</Badge>
            </div>
            <p className='text-foreground mt-1 text-sm font-medium'>
              {String(data.name ?? '')}
            </p>
            <div className='mt-1 flex items-center gap-2'>
              {type && (
                <Badge variant='base' className={join('text-xs capitalize', INGREDIENT_TYPE_COLORS[type])}>
                  {type}
                </Badge>
              )}
              {data.currentAmount != null && data.unit != null && (
                <span className='text-muted-foreground text-xs'>
                  {String(data.currentAmount)} {String(data.unit)}
                </span>
              )}
            </div>
          </div>
          {String(data.id ?? '') !== '' && (
            <Link
              to={`/ingredients/${String(data.id)}?from=chat`}
              className='text-primary hover:text-primary/80 text-sm font-medium'
            >
              View →
            </Link>
          )}
        </div>
      </Card>
    );
  }

  return <GenericResultCard result={result} />;
}

function ShoppingListResultCard({ toolName, result }: { toolName: string; result: NonNullable<ToolCallResultInfo['result']> }) {
  if (result.displayType === 'list') {
    const data = result.data as ListData | null;
    if (!data?.items || data.items.length === 0) {
      return (
        <Card className='overflow-hidden'>
          <div className='flex items-center gap-3 p-4'>
            <span className='text-2xl'>🛒</span>
            <div className='flex-1'>
              <p className='text-muted-foreground text-sm'>{result.message}</p>
            </div>
            <Link
              to='/shopping-list?from=chat'
              className='text-primary hover:text-primary/80 text-sm font-medium'
            >
              Open →
            </Link>
          </div>
        </Card>
      );
    }

    const unchecked = data.items.filter((i) => !i.checked);
    const checked = data.items.filter((i) => i.checked);

    return (
      <Card className='overflow-hidden'>
        <div className='flex flex-col gap-2 p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
              🛒 Shopping List ({data.total} {data.total === 1 ? 'item' : 'items'})
            </p>
            <Link
              to='/shopping-list?from=chat'
              className='text-primary hover:text-primary/80 text-xs font-medium'
            >
              Open Shopping List →
            </Link>
          </div>
          {unchecked.length > 0 && (
            <div className='flex flex-col gap-1'>
              {unchecked.slice(0, 15).map((item, idx) => (
                <ShoppingItem key={String(item.id ?? idx)} item={item} />
              ))}
            </div>
          )}
          {checked.length > 0 && (
            <div className='flex flex-col gap-1'>
              <p className='text-muted-foreground mt-1 text-xs'>
                ✓ {checked.length} checked
              </p>
              {checked.slice(0, 5).map((item, idx) => (
                <ShoppingItem key={String(item.id ?? idx)} item={item} />
              ))}
              {checked.length > 5 && (
                <p className='text-muted-foreground text-xs'>
                  …and {checked.length - 5} more checked
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (result.displayType === 'success' && result.data != null) {
    const data = result.data as Record<string, unknown>;
    const addedItems = data.addedItems as string[] | undefined;
    const count = Number(data.count ?? 0);

    return (
      <Card className='overflow-hidden'>
        <div className='flex flex-col gap-2 p-4'>
          <div className='flex items-center gap-2'>
            <span className='text-xl'>🛒</span>
            <Badge variant='success'>
              Added {count} {count === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          {addedItems && addedItems.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {addedItems.map((name, idx) => (
                <span key={idx} className='bg-muted text-foreground rounded-md px-2 py-1 text-xs'>
                  {name}
                </span>
              ))}
            </div>
          )}
          <Link
            to='/shopping-list?from=chat'
            className='text-primary hover:text-primary/80 text-sm font-medium'
          >
            View Shopping List →
          </Link>
        </div>
      </Card>
    );
  }

  if (toolName === 'check_shopping_items' || toolName === 'remove_shopping_items' || toolName === 'clear_checked_items') {
    return <GenericResultCard result={result} actionLink={{ path: '/shopping-list?from=chat', label: 'View Shopping List →' }} />;
  }

  return <GenericResultCard result={result} />;
}

function ShoppingItem({ item }: { item: Record<string, unknown> }) {
  const checked = Boolean(item.checked);
  const name = String(item.name ?? '');
  const amount = item.amount != null ? String(item.amount) : null;
  const unit = item.unit as string | undefined;
  const note = item.note as string | undefined;

  return (
    <div className={join(
      'flex items-center gap-2 rounded-md px-2 py-1 text-sm',
      checked && 'opacity-50',
    )}>
      <span className='text-xs'>{checked ? '☑' : '☐'}</span>
      <span className={join('text-foreground', checked && 'line-through')}>
        {name}
      </span>
      {amount && unit && (
        <span className='text-muted-foreground text-xs'>
          {amount} {unit}
        </span>
      )}
      {note && (
        <span className='text-muted-foreground text-xs italic'>
          ({note})
        </span>
      )}
    </div>
  );
}

function CalendarResultCard({ toolName, result }: { toolName: string; result: NonNullable<ToolCallResultInfo['result']> }) {
  if (result.displayType === 'list') {
    const data = result.data as ListData | null;
    if (!data?.items || data.items.length === 0) {
      return (
        <Card className='overflow-hidden'>
          <div className='flex items-center gap-3 p-4'>
            <span className='text-2xl'>📅</span>
            <div className='flex-1'>
              <p className='text-muted-foreground text-sm'>{result.message}</p>
            </div>
            <Link
              to='/calendar?from=chat'
              className='text-primary hover:text-primary/80 text-sm font-medium'
            >
              Open →
            </Link>
          </div>
        </Card>
      );
    }

    return (
      <Card className='overflow-hidden'>
        <div className='flex flex-col gap-2 p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
              📅 Meal Plan ({data.total} {data.total === 1 ? 'meal' : 'meals'})
            </p>
            <Link
              to='/calendar?from=chat'
              className='text-primary hover:text-primary/80 text-xs font-medium'
            >
              Open Calendar →
            </Link>
          </div>
          <div className='flex flex-col gap-1.5'>
            {data.items.slice(0, 10).map((item, idx) => {
              const category = item.category as RecipeCategory | undefined;
              const emoji = category ? (RECIPE_CATEGORY_EMOJIS[category] ?? '🍽️') : '🍽️';
              return (
                <div
                  key={String(item.id ?? idx)}
                  className='border-border flex items-center gap-3 rounded-lg border p-2'
                >
                  <span className='text-lg'>{emoji}</span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-foreground text-sm font-medium'>
                      {String(item.recipeName ?? 'Planned meal')}
                    </p>
                    <div className='mt-0.5 flex items-center gap-2'>
                      {String(item.date ?? '') !== '' && (
                        <span className='text-muted-foreground text-xs'>
                          {String(item.date)}
                        </span>
                      )}
                      {category && (
                        <Badge variant='base' className={join('text-xs capitalize', RECIPE_CATEGORY_COLORS[category])}>
                          {category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {String(item.recipeId ?? '') !== '' && (
                    <Link
                      to={`/recipes/${String(item.recipeId)}?from=chat`}
                      className='text-muted-foreground text-xs'
                    >
                      →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          {data.total > 10 && (
            <p className='text-muted-foreground text-xs'>
              …and {data.total - 10} more
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (result.displayType === 'success' && result.data != null) {
    const data = result.data as Record<string, unknown>;
    const category = data.category as RecipeCategory | undefined;
    const emoji = category ? (RECIPE_CATEGORY_EMOJIS[category] ?? '🍽️') : '🍽️';

    return (
      <Card className='overflow-hidden'>
        <div className='flex items-center gap-3 p-4'>
          <span className='text-2xl'>{emoji}</span>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <Badge variant='success'>Planned</Badge>
            </div>
            <p className='text-foreground mt-1 text-sm font-medium'>
              {result.message}
            </p>
          </div>
          <Link
            to='/calendar?from=chat'
            className='text-primary hover:text-primary/80 text-sm font-medium'
          >
            View Calendar →
          </Link>
        </div>
      </Card>
    );
  }

  if (toolName === 'update_planned_recipe' || toolName === 'remove_planned_recipe') {
    return <GenericResultCard result={result} actionLink={{ path: '/calendar?from=chat', label: 'View Calendar →' }} />;
  }

  return <GenericResultCard result={result} />;
}

function GenericResultCard({
  result,
  actionLink,
}: {
  result: NonNullable<ToolCallResultInfo['result']>;
  actionLink?: { path: string; label: string };
}) {
  return (
    <Card className='overflow-hidden'>
      <div className='flex items-center gap-3 p-4'>
        <div className='flex-1'>
          <p className='text-foreground text-sm'>{result.message}</p>
        </div>
        {actionLink && (
          <Link
            to={actionLink.path}
            className='text-primary hover:text-primary/80 text-sm font-medium'
          >
            {actionLink.label}
          </Link>
        )}
      </div>
    </Card>
  );
}

function ToolConfirmationDetail({ data, message }: { data: Record<string, unknown>; message: string }) {
  const proposedChanges = data.proposedChanges as Record<string, { current: unknown; proposed: unknown }> | undefined;

  return (
    <div className='mt-2'>
      {message && (
        <p className='text-muted-foreground text-sm'>{message}</p>
      )}
      {proposedChanges && (
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
      )}
    </div>
  );
}
