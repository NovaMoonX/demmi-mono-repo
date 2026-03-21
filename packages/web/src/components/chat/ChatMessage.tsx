import { ChatMessage as ChatMessageType } from '@lib/chat';
import { CopyButton } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import ReactMarkdown from 'react-markdown';
import { CreateMealAgentActionCard } from './agent-action-cards/CreateMealAgentActionCard';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  showDetails?: boolean;
  onEdit?: () => void;
  onConfirmIntent?: (messageId: string) => void;
  onRejectIntent?: (messageId: string) => void;
  onApproveAction?: (messageId: string) => void;
  onRejectAction?: (messageId: string) => void;
  onAddToShoppingList?: (messageId: string) => Promise<number>;
  onSkipShoppingList?: (messageId: string) => void;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatMessage({
  message,
  isStreaming = false,
  showDetails = false,
  onEdit,
  onConfirmIntent,
  onRejectIntent,
  onApproveAction,
  onRejectAction,
  onAddToShoppingList,
  onSkipShoppingList,
}: ChatMessageProps) {
  const isUser = message.role === 'user';

  const messageContent = message.content.trim();
  const showActions = !isStreaming && messageContent !== '';

  const displayAgentAction = message.agentAction && !isUser;
  return (
    <div
      className={join(
        'mb-4 flex w-full',
        'group',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={join(
          'flex flex-col gap-1',
          isUser
            ? 'max-w-[80%] items-end md:max-w-[70%]'
            : 'w-full max-w-[85%] items-start md:max-w-[75%]',
        )}
      >
        {(isStreaming || messageContent !== '') && (
          <div
            className={join(
              'min-w-fit rounded-2xl px-4 py-3',
              isUser
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-foreground',
            )}
          >
            {isStreaming && messageContent === '' ? (
              <div className='flex gap-1 text-xs'>
                <span className='animate-bounce'>●</span>
                <span className='animate-bounce [animation-delay:0.2s]'>●</span>
                <span className='animate-bounce [animation-delay:0.4s]'>●</span>
              </div>
            ) : isUser ? (
              <div className='wrap-break-word whitespace-pre-wrap'>
                {messageContent}
              </div>
            ) : (
              <div className='prose prose-sm dark:prose-invert max-w-none'>
                <ReactMarkdown>{messageContent}</ReactMarkdown>
                {isStreaming && !displayAgentAction && (
                  <span className='ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle' />
                )}
              </div>
            )}
          </div>
        )}

        {message.agentAction?.type === 'create_meal' &&
          onConfirmIntent &&
          onRejectIntent &&
          onApproveAction &&
          onRejectAction && (
            <CreateMealAgentActionCard
              action={message.agentAction}
              onConfirmIntent={() => onConfirmIntent(message.id)}
              onRejectIntent={() => onRejectIntent(message.id)}
              onApprove={() => onApproveAction(message.id)}
              onReject={() => onRejectAction(message.id)}
              onAddToShoppingList={
                onAddToShoppingList
                  ? () => onAddToShoppingList(message.id)
                  : undefined
              }
              onSkipShoppingList={
                onSkipShoppingList
                  ? () => onSkipShoppingList(message.id)
                  : undefined
              }
            />
          )}

        {showActions && (
          <div
            className={join(
              'flex items-center gap-0.5 px-1',
              'opacity-0 transition-opacity group-hover:opacity-100',
              isUser ? 'flex-row-reverse' : 'flex-row',
            )}
          >
            <CopyButton
              variant='base'
              size='stripped'
              textToCopy={messageContent}
              className='text-muted-foreground focus:outline-transparent!'
            />
            {isUser && (
              <button
                onClick={onEdit}
                className='text-muted-foreground hover:text-foreground rounded px-1.5 py-0.5 text-xs transition-colors'
              >
                edit
              </button>
            )}
          </div>
        )}
        {showDetails && (
          <div
            className={join(
              'flex items-center gap-2 px-1',
              showActions && '-mt-6 transition-[margin] group-hover:mt-0',
            )}
          >
            <span className='text-muted-foreground text-xs'>
              {formatTimestamp(message.timestamp)}
            </span>
            {!isUser && message.model && (
              <span className='text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5 font-mono text-xs'>
                {message.model}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
