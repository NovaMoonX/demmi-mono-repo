import { join } from '@moondreamsdev/dreamer-ui/utils';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { ChatConversation } from '@lib/chat';
import { Plus, Trash } from '@moondreamsdev/dreamer-ui/symbols';

interface ChatHistoryProps {
  conversations: ChatConversation[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onTogglePin: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatHistory({
  conversations,
  currentChatId,
  onSelectChat,
  onNewChat,
  onTogglePin,
  onDeleteChat,
}: ChatHistoryProps) {
  const pinnedChats = conversations.filter((c) => c.isPinned);
  const unpinnedChats = conversations.filter((c) => !c.isPinned);

  const renderChatItem = (chat: ChatConversation) => {
    const isActive = chat.id === currentChatId;

    return (
      <div
        key={chat.id}
        className={join(
          'group relative rounded-lg transition-colors',
          isActive
            ? 'bg-accent/10 border border-accent'
            : 'hover:bg-muted border border-transparent'
        )}
      >
        <button
          onClick={() => onSelectChat(chat.id)}
          className="w-full text-left px-3 py-2.5 pr-16"
        >
          <div className="flex items-start gap-2">
            {chat.isPinned && (
              <span className="text-accent text-xs shrink-0 mt-0.5">📌</span>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {chat.title}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </button>
        
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(chat.id);
            }}
            className={join(
              'p-1.5 rounded hover:bg-accent/20 transition-colors text-sm',
              chat.isPinned ? 'text-accent' : 'text-muted-foreground'
            )}
            aria-label={chat.isPinned ? 'Unpin chat' : 'Pin chat'}
          >
            📌
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChat(chat.id);
            }}
            className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete chat"
          >
            <Trash className="size-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border pt-12 md:pt-0">
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewChat}
          variant="primary"
          className="w-full"
        >
          <Plus className="size-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {pinnedChats.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Pinned
            </h3>
            <div className="space-y-1">
              {pinnedChats.map(renderChatItem)}
            </div>
          </div>
        )}

        {unpinnedChats.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Recent
            </h3>
            <div className="space-y-1">
              {unpinnedChats.map(renderChatItem)}
            </div>
          </div>
        )}

        {conversations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No chat history yet.
            <br />
            Start a new conversation!
          </div>
        )}
      </div>
    </div>
  );
}
