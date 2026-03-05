import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Textarea } from '@moondreamsdev/dreamer-ui/components';
import { ScrollArea } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { ChatHistoryToggleIcon } from '@components/ChatHistoryToggleIcon';
import { ChatHistory } from '@components/ChatHistory';
import { ChatMessage } from '@components/ChatMessage';
import { useIsMobileDevice } from '@hooks/useIsMobileDevice';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { store } from '@store/index';
import {
  setCurrentChat,
  createConversation,
  addMessage,
  deleteConversation,
  togglePinConversation,
} from '@store/slices/chatsSlice';
import {
  ChatMessage as ChatMessageType,
  generateMockResponse,
} from '@lib/chat';

// Delay to allow UI to render before scrolling to bottom
const SCROLL_DELAY_MS = 100;

export function Chat() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.chats.conversations);
  const currentChatId = useAppSelector((state) => state.chats.currentChatId);
  const [inputValue, setInputValue] = useState('');
  const isMobileDevice = useIsMobileDevice();
  const [isHistoryOpen, setIsHistoryOpen] = useState(() => !isMobileDevice);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = conversations.find((c) => c.id === currentChatId);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, SCROLL_DELAY_MS);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) {
      return;
    }

    const messageContent = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // Create user message
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };

    // If no current chat, create a new one
    if (!currentChatId) {
      const newConversation = {
        title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : ''),
        messages: [userMessage],
        isPinned: false,
        lastUpdated: Date.now(),
      };

      dispatch(createConversation(newConversation));

      // Simulate AI response
      setTimeout(() => {
        const assistantMessage: ChatMessageType = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: generateMockResponse(messageContent),
          timestamp: Date.now(),
        };

        // Get the current chat ID from the Redux store after createConversation has set it
        const currentChatId = store.getState().chats.currentChatId;
        if (currentChatId) {
          dispatch(addMessage({ chatId: currentChatId, message: assistantMessage }));
        }
        setIsSending(false);
      }, 1000);
    } else {
      // Add message to existing chat
      dispatch(addMessage({ chatId: currentChatId, message: userMessage }));

      // Simulate AI response
      setTimeout(() => {
        const assistantMessage: ChatMessageType = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: generateMockResponse(messageContent),
          timestamp: Date.now(),
        };

        dispatch(addMessage({ chatId: currentChatId, message: assistantMessage }));
        setIsSending(false);
      }, 1000);
    }
  };

  const handleNewChat = () => {
    dispatch(setCurrentChat(null));
    setInputValue('');
  };

  const handleSelectChat = (chatId: string) => {
    dispatch(setCurrentChat(chatId));
  };

  const handleTogglePin = (chatId: string) => {
    dispatch(togglePinConversation(chatId));
  };

  const handleDeleteChat = (chatId: string) => {
    dispatch(deleteConversation(chatId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isSendDisabled = !inputValue.trim() || isSending;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Chat History Sidebar */}
      <div
        className={join(
          'transition-all duration-300 border-r border-border',
          isHistoryOpen ? 'w-64' : 'w-0'
        )}
      >
        {isHistoryOpen && (
          <ChatHistory
            conversations={conversations}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onTogglePin={handleTogglePin}
            onDeleteChat={handleDeleteChat}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Header */}
        <div className="border-b border-border p-4 bg-card">
          <div className="flex items-start justify-between gap-4">
            <div
              className={join(
                'transition-[margin] duration-300 delay-50',
                isHistoryOpen ? 'ml-0' : 'ml-10 md:ml-0'
              )}
            >
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-foreground transition-colors hover:bg-muted"
                aria-label={isHistoryOpen ? 'Hide history' : 'Show history'}
              >
                <ChatHistoryToggleIcon />
              </button>
            </div>
            <div className="flex flex-1 flex-col items-end text-right">
              <h2 className="text-lg font-semibold text-foreground">
                {currentChat?.title || 'New Chat'}
              </h2>
              {currentChat && (
                <p className="text-sm text-muted-foreground">
                  {currentChat.messages.length} message{currentChat.messages.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          {currentChat ? (
            <div className="max-w-4xl mx-auto">
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isSending && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 bg-muted text-foreground">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce [animation-delay:0.2s]">●</span>
                      <span className="animate-bounce [animation-delay:0.4s]">●</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="text-6xl">💬</div>
                <h2 className="text-2xl font-bold text-foreground">
                  Start a New Conversation
                </h2>
                <p className="text-muted-foreground">
                  Ask me anything about cooking, recipes, meal planning, or ingredients!
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-11 max-h-50 resize-none pr-12"
                disabled={isSending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSendDisabled}
                variant="primary"
                className="absolute bottom-2.5 right-1.5  text-muted-foreground hover:text-foreground rounded-full!"
                aria-label="Send message"
                size='sm'
              >
                ↑
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
