import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Label, Toggle } from '@moondreamsdev/dreamer-ui/components';
import { Textarea } from '@moondreamsdev/dreamer-ui/components';
import { ScrollArea } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { ChatHistoryToggleIcon } from '@components/chat/ChatHistoryToggleIcon';
import { ChatHistory } from '@components/chat/ChatHistory';
import { ChatMessage } from '@components/chat/ChatMessage';
import { OllamaModelSelector } from '@components/chat/OllamaModelSelector';
import { useIsMobileDevice } from '@hooks/useIsMobileDevice';
import { useOllamaModels } from '@hooks/useOllamaModels';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { store } from '@store/index';
import {
  setCurrentChat,
  createConversation,
  addMessage,
  removeMessage,
  updateMessageContent,
  deleteConversation,
  togglePinConversation,
} from '@store/slices/chatsSlice';
import { ChatMessage as ChatMessageType } from '@lib/chat';
import type { AbortableAsyncIterator } from 'ollama';
import type { ChatResponse } from 'ollama/browser';
import { startChatStream } from '@lib/ollama';
import { generatedId } from '@utils/generatedId';

const SCROLL_DELAY_MS = 100;

export function Chat() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.chats.conversations);
  const currentChatId = useAppSelector((state) => state.chats.currentChatId);
  const authUser = useAppSelector((state) => state.user.user);
  const [inputValue, setInputValue] = useState('');
  const isMobileDevice = useIsMobileDevice();
  const [isHistoryOpen, setIsHistoryOpen] = useState(() => !isMobileDevice);
  const [isSending, setIsSending] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeStreamRef = useRef<AbortableAsyncIterator<ChatResponse> | null>(null);
  const currentGenerationId = useRef<string | null>(null);
  const cancelledRef = useRef(false);
  const firstTokenReceivedRef = useRef(false);
  const activeChatIdRef = useRef<string | null>(null);
  const activeMessageIdRef = useRef<string | null>(null);

  const {
    availableModels,
    selectedModel,
    isLoading: isLoadingModels,
    error: modelError,
    selectModel,
    isPulling,
    pullProgress,
    pullError,
    pullMistral,
  } = useOllamaModels();

  const currentChat = conversations.find((c) => c.id === currentChatId);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, SCROLL_DELAY_MS);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, scrollToBottom]);

  const handleCancelStream = () => {
    cancelledRef.current = true;
    currentGenerationId.current = null;
    
    if (!firstTokenReceivedRef.current && activeChatIdRef.current && activeMessageIdRef.current) {
      dispatch(removeMessage({
        chatId: activeChatIdRef.current,
        messageId: activeMessageIdRef.current,
      }));
    }
    
    if (activeStreamRef.current) {
      activeStreamRef.current.abort();
      activeStreamRef.current = null;
    }
    
    firstTokenReceivedRef.current = false;
    activeChatIdRef.current = null;
    activeMessageIdRef.current = null;
    setIsSending(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || !selectedModel) {
      return;
    }

    const messageContent = inputValue.trim();
    setInputValue('');
    setIsSending(true);
    
    const generationId = generatedId('msg');
    currentGenerationId.current = generationId;
    cancelledRef.current = false;
    firstTokenReceivedRef.current = false;

    const userMessage: ChatMessageType = {
      id: generatedId('msg'),
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
      model: null,
    };

    const assistantMessageId = generatedId('msg');
    const assistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: null,
    };

    let targetChatId: string | null;

    if (!currentChatId) {
      const newConversation = {
        title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : ''),
        messages: [userMessage, assistantMessage],
        isPinned: false,
        lastUpdated: Date.now(),
        userId: authUser?.uid ?? 'demo',
      };

      dispatch(createConversation(newConversation));
      targetChatId = store.getState().chats.currentChatId;
    } else {
      targetChatId = currentChatId;
      dispatch(addMessage({ chatId: currentChatId, message: userMessage }));
      dispatch(addMessage({ chatId: currentChatId, message: assistantMessage }));
    }

    if (!targetChatId) {
      setIsSending(false);
      return;
    }

    const chatIdForStream = targetChatId;
    const modelUsed = selectedModel;
    
    activeChatIdRef.current = chatIdForStream;
    activeMessageIdRef.current = assistantMessageId;

    try {
      const allMessages = store
        .getState()
        .chats.conversations.find((c) => c.id === chatIdForStream)
        ?.messages.filter((m) => m.id !== assistantMessageId) ?? [];

      const stream = await startChatStream(modelUsed, allMessages);
      
      if (currentGenerationId.current !== generationId || cancelledRef.current) {
        stream.abort();
        if (!firstTokenReceivedRef.current) {
          dispatch(removeMessage({
            chatId: chatIdForStream,
            messageId: assistantMessageId,
          }));
        }
        return;
      }
      
      activeStreamRef.current = stream;

      let accumulatedContent = '';

      for await (const chunk of stream) {
        if (currentGenerationId.current !== generationId || cancelledRef.current) {
          break;
        }
        
        if (!firstTokenReceivedRef.current) {
          firstTokenReceivedRef.current = true;
        }
        
        accumulatedContent += chunk.message.content;
        dispatch(
          updateMessageContent({
            chatId: chatIdForStream,
            messageId: assistantMessageId,
            content: accumulatedContent,
            model: modelUsed,
          }),
        );
      }
    } catch (err) {
      const isAbort =
        err instanceof Error &&
        (err.name === 'AbortError' || err.message.toLowerCase().includes('abort'));

      if (!isAbort) {
        const errorContent =
          err instanceof Error
            ? `⚠️ Ollama error: ${err.message}`
            : '⚠️ Could not reach Ollama. Make sure it is running on localhost:11434.';

        dispatch(
          updateMessageContent({
            chatId: chatIdForStream,
            messageId: assistantMessageId,
            content: errorContent,
          }),
        );
      }
    } finally {
      if (currentGenerationId.current === generationId) {
        activeStreamRef.current = null;
        currentGenerationId.current = null;
        firstTokenReceivedRef.current = false;
        activeChatIdRef.current = null;
        activeMessageIdRef.current = null;
        setIsSending(false);
      }
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

  const isSendDisabled = !inputValue.trim() || isSending || !selectedModel;

  return (
    <div className="h-full flex overflow-hidden">
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

      <div className="flex-1 flex flex-col bg-background">
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
            <div className="flex flex-1 flex-col items-end gap-1 text-right">
              <h2 className="text-lg font-semibold text-foreground">
                {currentChat?.title ?? 'New Chat'}
              </h2>
              {currentChat && (
                <p className="text-sm text-muted-foreground">
                  {currentChat.messages.length} message{currentChat.messages.length !== 1 ? 's' : ''}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Label htmlFor="toggle-details" className='text-muted-foreground text-sm'>
                  Show message details
                </Label>
                <Toggle
                  id="toggle-details"
                  checked={showDetails}
                  size='sm'
                  onCheckedChange={() => setShowDetails((v) => !v)}
                  aria-label="Toggle message details"
                />

                <OllamaModelSelector
                  models={availableModels}
                  selectedModel={selectedModel}
                  isLoading={isLoadingModels}
                  error={modelError}
                  disabled={isSending}
                  isPulling={isPulling}
                  pullProgress={pullProgress}
                  pullError={pullError}
                  onSelectModel={selectModel}
                  onPullMistral={pullMistral}
                />
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 md:p-6">
          {currentChat ? (
            <div className="max-w-4xl mx-auto">
              {currentChat.messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={
                    isSending &&
                    message.role === 'assistant' &&
                    index === currentChat.messages.length - 1
                  }
                  showDetails={showDetails}
                />
              ))}
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

        <div className="border-t border-border p-4 bg-card">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedModel ? 'Type your message... (Enter to send, Shift+Enter for new line)' : 'Select a model above to start chatting...'}
                className="min-h-11 max-h-50 resize-none pr-24"
                disabled={isSending || !selectedModel}
              />
              <div className="absolute bottom-2.5 right-1.5 flex gap-1">
                {isSending && (
                  <Button
                    onClick={handleCancelStream}
                    variant="secondary"
                    className="rounded-full!"
                    aria-label="Cancel response"
                    size="sm"
                  >
                    ✕
                  </Button>
                )}
                <Button
                  onClick={handleSendMessage}
                  disabled={isSendDisabled}
                  variant="primary"
                  className="text-muted-foreground hover:text-foreground rounded-full!"
                  aria-label="Send message"
                  size="sm"
                >
                  ↑
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;

