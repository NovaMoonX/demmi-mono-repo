import { join } from '@moondreamsdev/dreamer-ui/utils';
import { ChatMessage as ChatMessageType } from '@lib/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  showDetails?: boolean;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatMessage({ message, isStreaming = false, showDetails = false }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const messageContent = message.content.trim();
  return (
    <div
      className={join(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={join('flex flex-col gap-1 max-w-[80%] md:max-w-[70%] ', isUser ? 'items-end' : 'items-start')}>
        <div
          className={join(
            'rounded-2xl px-4 py-3 min-w-fit',
            isUser
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          {isStreaming && messageContent === '' ? (
            <div className="flex gap-1 text-xs">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce [animation-delay:0.2s]">●</span>
              <span className="animate-bounce [animation-delay:0.4s]">●</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap wrap-break-word">
              {messageContent}
              {isStreaming && <span className="ml-0.5 inline-block w-0.5 h-4 bg-current animate-pulse align-middle" />}
            </div>
          )}
        </div>
        {showDetails && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message.timestamp)}
            </span>
            {!isUser && message.model && (
              <span className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-1.5 py-0.5">
                {message.model}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
