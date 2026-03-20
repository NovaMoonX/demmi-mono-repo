import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Label, Toggle } from '@moondreamsdev/dreamer-ui/components';
import { Textarea } from '@moondreamsdev/dreamer-ui/components';
import { ScrollArea } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useActionModal } from '@moondreamsdev/dreamer-ui/hooks';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { ChatHistoryToggleIcon } from '@components/chat/ChatHistoryToggleIcon';
import { ChatHistory } from '@components/chat/ChatHistory';
import { ChatMessage } from '@components/chat/ChatMessage';
import { OllamaModelControl } from '@components/chat/OllamaModelControl';
import { useIsMobileDevice } from '@hooks/useIsMobileDevice';
import { useOllamaModels } from '@hooks/useOllamaModels';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { store } from '@store/index';
import {
  setCurrentChat,
  createConversation,
  addMessage,
  removeMessage,
  trimMessagesFrom,
  updateMessageContent,
  updateAgentActionStatus,
  updateMessageSummary,
  updateRecipeStep,
  cancelRecipeGeneration,
  deleteConversation,
  togglePinConversation,
} from '@store/slices/chatsSlice';
import { createIngredient } from '@store/actions/ingredientActions';
import { createMeal } from '@store/actions/mealActions';
import { ChatMessage as ChatMessageType } from '@lib/chat';
import type { MealIngredient } from '@lib/meals';
import {
  detectIntent,
  generateSummary,
  getActionHandler,
} from '@lib/ollama';
import type { RecipeStep } from '@lib/ollama/action-types/createMealAction.types';
import { generatedId } from '@utils/generatedId';

const SCROLL_DELAY_MS = 100;

export function Chat() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.chats.conversations);
  const currentChatId = useAppSelector((state) => state.chats.currentChatId);
  const authUser = useAppSelector((state) => state.user.user);
  const [inputValue, setInputValue] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const isMobileDevice = useIsMobileDevice();
  const [isHistoryOpen, setIsHistoryOpen] = useState(() => !isMobileDevice);
  const [isSending, setIsSending] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const firstTokenReceivedRef = useRef(false);
  const activeChatIdRef = useRef<string | null>(null);
  const activeMessageIdRef = useRef<string | null>(null);
  const { confirm } = useActionModal();
  const { addToast } = useToast();

  const { selectedModel } = useOllamaModels();

  const currentChat = conversations.find((c) => c.id === currentChatId);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, SCROLL_DELAY_MS);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, scrollToBottom]);

  useEffect(() => {
    setEditingMessageId(null);
    setInputValue('');
  }, [currentChatId]);

  const handleEditMessage = async (messageId: string) => {
    const message = currentChat?.messages.find((m) => m.id === messageId);
    if (!message) return;

    if (inputValue.trim()) {
      const confirmed = await confirm({
        title: 'Replace unsent message',
        message:
          "You have unsent text in the input. Do you want to replace it with the message you're editing?",
        confirmText: 'Replace',
        cancelText: 'Cancel',
      });
      if (!confirmed) return;
    }

    setInputValue(message.content.trim());
    setEditingMessageId(messageId);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInputValue('');
  };

  const handleCancelGeneration = () => {
    if (
      !firstTokenReceivedRef.current &&
      activeChatIdRef.current &&
      activeMessageIdRef.current
    ) {
      dispatch(
        removeMessage({
          chatId: activeChatIdRef.current,
          messageId: activeMessageIdRef.current,
        }),
      );
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    firstTokenReceivedRef.current = false;
    activeChatIdRef.current = null;
    activeMessageIdRef.current = null;
    setIsSending(false);
  };

  const handleConfirmIntent = async (messageId: string) => {
    const chatId = currentChatId;
    if (!chatId || !selectedModel) return;

    const message = store
      .getState()
      .chats.conversations.find((c) => c.id === chatId)
      ?.messages.find((m) => m.id === messageId);

    const action = message?.agentAction;
    if (
      !action ||
      action.type !== 'create_meal' ||
      action.status !== 'pending_confirmation'
    )
      return;

    setIsSending(true);
    firstTokenReceivedRef.current = true;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    activeChatIdRef.current = chatId;
    activeMessageIdRef.current = messageId;

    const allMessages =
      store
        .getState()
        .chats.conversations.find((c) => c.id === chatId)
        ?.messages ?? [];

    const handler = getActionHandler('createMeal');

    try {
      // Set the initial generating state before the pipeline starts.
      dispatch(
        updateMessageContent({
          chatId,
          messageId,
          content: '🍳 Generating recipe...',
          agentAction: {
            type: 'create_meal',
            status: 'generating_name',
            proposedName: action.proposedName,
            meals: [],
            recipe: null,
            completedSteps: null,
          },
        }),
      );

      const result = await handler.execute(
        selectedModel,
        // Pass the previously agreed name as initial context so proposeNameStep
        // reuses it directly instead of generating a new (potentially different) name.
        { messages: allMessages, previousResults: { name: action.proposedName } },
        {
          abortSignal: abortController.signal,
          // Each completed step notifies the consumer to update the partial recipe UI.
          // The key is always a valid RecipeStep — guaranteed by STEP_RECIPE_KEY's type in createMealAction.
          onStepComplete: (key, data) => {
            dispatch(
              updateRecipeStep({
                chatId,
                messageId,
                step: key as RecipeStep,
                data,
              }),
            );
          },
        },
      );

      if (result.cancelled) {
        dispatch(cancelRecipeGeneration({ chatId, messageId }));
      } else {
        // Build the meal proposal and transition to pending_approval.
        const proposal = result.data.proposal;
        if (proposal) {
          dispatch(
            updateAgentActionStatus({
              chatId,
              messageId,
              status: 'pending_approval',
              meals: [proposal],
            }),
          );
        }

        const messageContentUpdates =
          handler.getUpdatedMessageContentFromResult?.(result.data);

        if (messageContentUpdates) {
          dispatch(
            updateMessageContent({
              chatId,
              messageId,
              ...messageContentUpdates,
            }),
          );

          const allCurrentMessages =
            store
              .getState()
              .chats.conversations.find((c) => c.id === chatId)
              ?.messages ?? [];
          const msgIndex = allCurrentMessages.findIndex(
            (m) => m.id === messageId,
          );
          const userMessage =
            msgIndex > 0 ? allCurrentMessages[msgIndex - 1] : null;

          if (userMessage?.role === 'user') {
            generateSummary(
              selectedModel,
              userMessage.rawContent ?? userMessage.content,
              messageContentUpdates.content,
            )
              .then((summary) => {
                if (summary) {
                  dispatch(
                    updateMessageSummary({ chatId, messageId, summary }),
                  );
                }
              })
              .catch((err) => console.warn('Summary generation failed', err));
          }
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        const errMsg =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        addToast({
          title: 'Generation failed',
          description: errMsg,
          type: 'error',
        });
        dispatch(
          updateAgentActionStatus({
            chatId,
            messageId,
            status: 'pending_confirmation',
          }),
        );
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
        firstTokenReceivedRef.current = false;
        activeChatIdRef.current = null;
        activeMessageIdRef.current = null;
        setIsSending(false);
      }
    }
  };

  const handleRejectIntent = (messageId: string) => {
    if (!currentChatId) return;
    dispatch(
      updateAgentActionStatus({
        chatId: currentChatId,
        messageId,
        status: 'rejected',
      }),
    );
    dispatch(
      updateMessageContent({
        chatId: currentChatId,
        messageId,
        content: "Got it! I won't create that recipe. Let me know if you'd like help with something else.",
      }),
    );
  };

  const handleApproveAction = async (messageId: string) => {
    const chatId = currentChatId;
    if (!chatId) return;

    const message = store
      .getState()
      .chats.conversations.find((c) => c.id === chatId)
      ?.messages.find((m) => m.id === messageId);

    const action = message?.agentAction;
    if (
      !action ||
      action.type !== 'create_meal' ||
      action.status !== 'pending_approval'
    )
      return;

    dispatch(
      updateAgentActionStatus({ chatId, messageId, status: 'approved' }),
    );

    let mealsCreated = 0;

    try {
      for (const mealProposal of action.meals) {
        const mealIngredients: MealIngredient[] = [];

        for (const ingredientProposal of mealProposal.ingredients) {
          if (!ingredientProposal.isNew && ingredientProposal.existingIngredientId) {
            mealIngredients.push({
              ingredientId: ingredientProposal.existingIngredientId,
              servings: ingredientProposal.servings,
            });
          } else {
            const created = await dispatch(
              createIngredient({
                name: ingredientProposal.name,
                type: ingredientProposal.type,
                unit: ingredientProposal.unit,
                imageUrl: '',
                nutrients: {
                  protein: 0,
                  carbs: 0,
                  fat: 0,
                  fiber: 0,
                  sugar: 0,
                  sodium: 0,
                  calories: 0,
                },
                currentAmount: 0,
                servingSize: 1,
                otherUnit: null,
                products: [],
                defaultProductId: null,
              }),
            ).unwrap();

            mealIngredients.push({
              ingredientId: created.id,
              servings: ingredientProposal.servings,
            });
          }
        }

        await dispatch(
          createMeal({
            title: mealProposal.title,
            description: mealProposal.description,
            category: mealProposal.category,
            prepTime: mealProposal.prepTime,
            cookTime: mealProposal.cookTime,
            servingSize: mealProposal.servingSize,
            instructions: mealProposal.instructions,
            imageUrl: mealProposal.imageUrl,
            ingredients: mealIngredients,
          }),
        ).unwrap();

        mealsCreated++;
      }
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      addToast({
        title: 'Failed to save',
        description: errMsg,
        type: 'error',
      });
      dispatch(
        updateAgentActionStatus({
          chatId,
          messageId,
          status: 'pending_approval',
        }),
      );
      return;
    }

    if (mealsCreated > 0) {
      addToast({
        title: 'Meals saved!',
        description: `${mealsCreated} ${mealsCreated === 1 ? 'meal' : 'meals'} added to your collection.`,
        type: 'success',
      });

      const savedMealsText =
        mealsCreated === 1
          ? `**${action.meals[0].title}**`
          : `**${mealsCreated} recipes**`;
      dispatch(
        updateMessageContent({
          chatId,
          messageId,
          content: `I've saved ${savedMealsText} to your meals collection! 🎉`,
        }),
      );
    }
  };

  const handleRejectAction = (messageId: string) => {
    if (!currentChatId) return;
    dispatch(
      updateAgentActionStatus({
        chatId: currentChatId,
        messageId,
        status: 'rejected',
      }),
    );
    dispatch(
      updateMessageContent({
        chatId: currentChatId,
        messageId,
        content: "No problem! The recipe has been discarded. Let me know if you'd like to create a different one.",
      }),
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || !selectedModel) {
      return;
    }

    const messageContent = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    const editMessageId = editingMessageId;
    setEditingMessageId(null);

    if (editMessageId && currentChatId) {
      dispatch(
        trimMessagesFrom({ chatId: currentChatId, messageId: editMessageId }),
      );
    }

    firstTokenReceivedRef.current = false;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMessage: ChatMessageType = {
      id: generatedId('msg'),
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
      model: null,
      rawContent: null,
      agentAction: null,
      summary: null,
    };

    const assistantMessageId = generatedId('msg');
    const assistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: null,
      rawContent: null,
      agentAction: null,
      summary: null,
    };

    let targetChatId: string | null;

    if (!currentChatId) {
      const newConversation = {
        title:
          messageContent.slice(0, 50) +
          (messageContent.length > 50 ? '...' : ''),
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
      dispatch(
        addMessage({ chatId: currentChatId, message: assistantMessage }),
      );
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
      const allMessages =
        store
          .getState()
          .chats.conversations.find((c) => c.id === chatIdForStream)
          ?.messages.filter((m) => m.id !== assistantMessageId) ?? [];

      const intent = await detectIntent(modelUsed, allMessages);

      if (abortController.signal.aborted) {
        if (!firstTokenReceivedRef.current) {
          dispatch(
            removeMessage({
              chatId: chatIdForStream,
              messageId: assistantMessageId,
            }),
          );
        }
        return;
      }

      const handler = getActionHandler(intent);

      if (handler.isMultiStep) {
        firstTokenReceivedRef.current = true;

        const stepResult = await handler.executeStep(
          modelUsed,
          'proposeName',
          { messages: allMessages },
          {
            abortSignal: abortController.signal,
          },
        );

        if (stepResult.cancelled) return;

        const proposedNameFromStep = stepResult.data.name;
        const proposedName =
          typeof proposedNameFromStep === 'string' &&
          proposedNameFromStep.trim().length > 0
            ? proposedNameFromStep
            : null;

        if (abortController.signal.aborted) return;

        dispatch(
          updateMessageContent({
            chatId: chatIdForStream,
            messageId: assistantMessageId,
            content: proposedName
              ? `I can help you create a recipe for **${proposedName}**! Shall I go ahead?`
              : "I'd like to help you create a recipe! I wasn't able to detect the dish name — could you confirm what you'd like me to make?",
            agentAction: {
              type: 'create_meal',
              status: 'pending_confirmation',
              proposedName: proposedName ?? '',
              meals: [],
              recipe: null,
              completedSteps: null,
            },
          }),
        );
      } else {
        firstTokenReceivedRef.current = true;

        const result = await handler.execute(
          modelUsed,
          { messages: allMessages },
          {
            abortSignal: abortController.signal,
            // The handler streams partial content via this callback; the consumer owns the dispatch.
            onProgress: (content) => {
              dispatch(
                updateMessageContent({
                  chatId: chatIdForStream,
                  messageId: assistantMessageId,
                  content,
                }),
              );
            },
          },
        );

        if (!abortController.signal.aborted && !result.cancelled) {
          const messageContentUpdates =
            handler.getUpdatedMessageContentFromResult(result.data);

          dispatch(
            updateMessageContent({
              chatId: chatIdForStream,
              messageId: assistantMessageId,
              model: modelUsed,
              ...messageContentUpdates,
            }),
          );

          generateSummary(
            modelUsed,
            messageContent,
            messageContentUpdates.content,
          )
            .then((summary) => {
              if (summary) {
                dispatch(
                  updateMessageSummary({
                    chatId: chatIdForStream,
                    messageId: assistantMessageId,
                    summary,
                  }),
                );
              }
            })
            .catch((err) => console.warn('Summary generation failed', err));
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
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
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
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
    setEditingMessageId(null);
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
    <div className='flex h-full overflow-hidden'>
      <div
        className={join(
          'border-border border-r transition-all duration-300',
          isHistoryOpen ? 'w-64' : 'w-0',
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

      <div className='bg-background flex flex-1 flex-col'>
        <div className='border-border bg-card border-b p-4'>
          <div className='flex items-start justify-between gap-4'>
            <div
              className={join(
                'transition-[margin] delay-50 duration-300',
                isHistoryOpen ? 'ml-0' : 'ml-10 md:ml-0',
              )}
            >
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className='border-border bg-background text-foreground hover:bg-muted inline-flex items-center justify-center rounded-md border p-2 transition-colors'
                aria-label={isHistoryOpen ? 'Hide history' : 'Show history'}
              >
                <ChatHistoryToggleIcon />
              </button>
            </div>
            <div className='flex flex-1 flex-col items-end gap-1 text-right'>
              <h2 className='text-foreground text-lg font-semibold'>
                {currentChat?.title ?? 'New Chat'}
              </h2>
              {currentChat && (
                <p className='text-muted-foreground text-sm'>
                  {currentChat.messages.length} message
                  {currentChat.messages.length !== 1 ? 's' : ''}
                </p>
              )}
              <div className='flex items-center gap-2'>
                <Label
                  htmlFor='toggle-details'
                  className='text-muted-foreground text-sm'
                >
                  Show message details
                </Label>
                <Toggle
                  id='toggle-details'
                  checked={showDetails}
                  size='sm'
                  onCheckedChange={() => setShowDetails((v) => !v)}
                  aria-label='Toggle message details'
                />

                <OllamaModelControl disabled={isSending} />
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className='flex-1 p-4 md:p-6'>
          {currentChat ? (
            <div className='mx-auto max-w-4xl'>
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
                  onEdit={() => handleEditMessage(message.id)}
                  onConfirmIntent={handleConfirmIntent}
                  onRejectIntent={handleRejectIntent}
                  onApproveAction={handleApproveAction}
                  onRejectAction={handleRejectAction}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className='flex h-full items-center justify-center'>
              <div className='max-w-md space-y-4 text-center'>
                <div className='text-6xl'>💬</div>
                <h2 className='text-foreground text-2xl font-bold'>
                  Start a New Conversation
                </h2>
                <p className='text-muted-foreground'>
                  Ask me anything about cooking, recipes, meal planning, or
                  ingredients!
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className='border-border bg-card border-t p-4'>
          <div className='mx-auto max-w-4xl'>
            {editingMessageId && (
              <div
                className={join(
                  'mb-2 flex items-center justify-between rounded-lg px-1 py-1.5',
                  'bg-muted/60 border-border text-muted-foreground border text-xs',
                )}
              >
                <span>
                  ✏️ Editing message — the original and all following messages
                  will be replaced
                </span>
                <button
                  onClick={handleCancelEdit}
                  className='hover:text-foreground ml-2 transition-colors'
                  aria-label='Cancel edit'
                >
                  ✕
                </button>
              </div>
            )}
            <div className='relative'>
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedModel
                    ? 'Type your message... (Enter to send, Shift+Enter for new line)'
                    : 'Select a model above to start chatting...'
                }
                className='max-h-50 min-h-11 resize-none pr-24'
                disabled={isSending || !selectedModel}
              />
              <div className='absolute right-1.5 bottom-2.5 flex gap-1'>
                {isSending && (
                  <Button
                    onClick={handleCancelGeneration}
                    variant='secondary'
                    className='rounded-full!'
                    aria-label='Cancel response'
                    size='sm'
                  >
                    ✕
                  </Button>
                )}
                <Button
                  onClick={handleSendMessage}
                  disabled={isSendDisabled}
                  variant='primary'
                  className='text-muted-foreground hover:text-foreground rounded-full!'
                  aria-label='Send message'
                  size='sm'
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
