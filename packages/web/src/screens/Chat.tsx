import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button, Callout, Label, Toggle } from '@moondreamsdev/dreamer-ui/components';
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
import { useRuntimeEnvironment } from '@hooks/useRuntimeEnvironment';
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
  markMessageIterationInvalid,
  setRecipeActionShoppingListDecision,
  deleteConversation,
  togglePinConversation,
  initToolCalls,
  updateToolCallStatus,
} from '@store/slices/chatsSlice';
import { createIngredient } from '@store/actions/ingredientActions';
import { createRecipe } from '@store/actions/recipeActions';
import { createShoppingListItem } from '@store/actions/shoppingListActions';
import { ChatMessage as ChatMessageType } from '@lib/chat';
import type { Recipe, RecipeIngredient } from '@lib/recipes';
import {
  detectIntent,
  generateSummary,
  getActionHandler,
  iterateRecipeAction,
  toolCallAction,
} from '@lib/ollama';
import type { RecipeIterableField } from '@lib/ollama/action-types/createRecipeAction.types';
import type { RecipeStep } from '@lib/ollama/action-types/createRecipeAction.types';
import type { ToolCallRuntime, ToolCallResult } from '@lib/ollama/actions/toolCallAction';
import type { ToolCallResultInfo } from '@lib/ollama/action-types/toolCallAction.types';
import { generatedId } from '@utils/generatedId';

const SCROLL_DELAY_MS = 100;

function buildIterationContextMessages(
  existingMessages: ChatMessageType[],
  pendingApprovalMessage: ChatMessageType,
  latestUserMessage: ChatMessageType,
): ChatMessageType[] {
  const pendingIndex = existingMessages.findIndex(
    (message) => message.id === pendingApprovalMessage.id,
  );

  if (pendingIndex === -1) {
    return [latestUserMessage];
  }

  let threadStartIndex = 0;
  for (let i = pendingIndex; i >= 0; i--) {
    const message = existingMessages[i];
    const isAssistantNonRecipeMessage =
      message.role === 'assistant' &&
      message.agentAction?.type !== 'create_recipe';

    if (isAssistantNonRecipeMessage) {
      threadStartIndex = i + 1;
      break;
    }

    if (i === 0) {
      threadStartIndex = 0;
    }
  }

  const threadMessages = existingMessages.slice(
    threadStartIndex,
    pendingIndex + 1,
  );

  const contextMessages = threadMessages.flatMap((message, idx) => {
    if (message.role === 'user') {
      // Skip messages that were flagged as invalid iteration attempts — they were
      // unrelated to the recipe and would reduce the quality of subsequent LLM calls.
      if (message.iterationInvalid === true) {
        return [];
      }
      return [message];
    }

    // Skip assistant messages that immediately follow an invalid user message,
    // so the agent's "I'm not sure what you want to change" response is also excluded.
    // Note: `idx` is the index in the original `threadMessages` array, so
    // `threadMessages[idx - 1]` is always the immediately preceding thread message.
    const previousThreadMessage = threadMessages[idx - 1];
    if (
      previousThreadMessage?.role === 'user' &&
      previousThreadMessage.iterationInvalid === true
    ) {
      return [];
    }

    if (message.summary) {
      const summaryMessage: ChatMessageType = {
        id: `summary-${message.id}`,
        role: 'assistant',
        content: message.summary,
        timestamp: message.timestamp,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      };
      return [summaryMessage];
    }

    return [];
  });

  const result = [...contextMessages, latestUserMessage];
  return result;
}

export function Chat() {
  const { isMobileWebView, canInstallOllama } = useRuntimeEnvironment();
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
  const [useToolCalling, setUseToolCalling] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const firstTokenReceivedRef = useRef(false);
  const activeChatIdRef = useRef<string | null>(null);
  const activeMessageIdRef = useRef<string | null>(null);
  const { confirm } = useActionModal();
  const { addToast } = useToast();

  const { selectedModel, error: ollamaError, isLoading: ollamaLoading } = useOllamaModels();

  const currentChat = useMemo(() => {
    const result = conversations.find((c) => c.id === currentChatId) ?? null;
    return result;
  }, [conversations, currentChatId]);

  const currentMessages = useMemo(() => {
    const result = currentChat?.messages ?? [];
    return result;
  }, [currentChat]);

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

    const message = currentMessages.find((m) => m.id === messageId);

    const action = message?.agentAction;
    if (
      !action ||
      action.type !== 'create_recipe' ||
      action.status !== 'pending_confirmation'
    )
      return;

    setIsSending(true);
    firstTokenReceivedRef.current = true;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    activeChatIdRef.current = chatId;
    activeMessageIdRef.current = messageId;

    const allMessages = [...currentMessages];

    const handler = getActionHandler('createRecipe');

    try {
      // Set the initial generating state before the pipeline starts.
      dispatch(
        updateMessageContent({
          chatId,
          messageId,
          content: '🍳 Generating recipe...',
          agentAction: {
            type: 'create_recipe',
            status: 'generating_name',
            proposedName: action.proposedName,
            recipes: [],
            recipe: null,
            completedSteps: null,
            updatingFields: null,
            shoppingListDecision: null,
            shoppingListItemsAdded: null,
          },
        }),
      );

      const result = await handler.execute(
        selectedModel,
        // Pass the previously agreed name as initial context so proposeNameStep
        // reuses it directly instead of generating a new (potentially different) name.
        {
          messages: allMessages,
          previousResults: { name: action.proposedName },
        },
        {
          abortSignal: abortController.signal,
          // Each completed step notifies the consumer to update the partial recipe UI.
          // The key is always a valid RecipeStep — guaranteed by STEP_RECIPE_KEY's type in createRecipeAction.
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
        // Build the recipe proposal and transition to pending_approval.
        const proposal = result.data.proposal;
        if (proposal) {
          dispatch(
            updateAgentActionStatus({
              chatId,
              messageId,
              status: 'pending_approval',
              recipes: [proposal],
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

          const msgIndex = allMessages.findIndex((m) => m.id === messageId);
          const userMessage = msgIndex > 0 ? allMessages[msgIndex - 1] : null;

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
        content:
          "Got it! I won't create that recipe. Let me know if you'd like help with something else.",
      }),
    );
  };

  const handleApproveAction = async (messageId: string) => {
    const chatId = currentChatId;
    if (!chatId) return;

    const message = currentMessages.find((m) => m.id === messageId);

    const action = message?.agentAction;
    if (
      !action ||
      action.type !== 'create_recipe' ||
      action.status !== 'pending_approval'
    )
      return;

    dispatch(
      updateAgentActionStatus({ chatId, messageId, status: 'approved' }),
    );

    let recipesCreated = 0;

    try {
      for (const recipeProposal of action.recipes) {
        const recipeIngredients: RecipeIngredient[] = [];

        for (const ingredientProposal of recipeProposal.ingredients) {
          if (
            !ingredientProposal.isNew &&
            ingredientProposal.existingIngredientId
          ) {
            recipeIngredients.push({
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
                barcode: null,
              }),
            ).unwrap();

            recipeIngredients.push({
              ingredientId: created.id,
              servings: ingredientProposal.servings,
            });
          }
        }

        const recipe: Omit<Recipe, 'id' | 'userId'> = {
          title: recipeProposal.title,
          description: recipeProposal.description,
          category: recipeProposal.category,
          cuisine: recipeProposal.cuisine,
          prepTime: recipeProposal.prepTime,
          cookTime: recipeProposal.cookTime,
          servingSize: recipeProposal.servingSize,
          instructions: recipeProposal.instructions,
          imageUrl: recipeProposal.imageUrl,
          ingredients: recipeIngredients,
          share: null,
        };
        await dispatch(createRecipe(recipe)).unwrap();

        recipesCreated++;
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

    if (recipesCreated > 0) {
      addToast({
        title: 'Recipes saved!',
        description: `${recipesCreated} ${recipesCreated === 1 ? 'recipe' : 'recipes'} added to your collection.`,
        type: 'success',
      });
    }
  };

  const handleAddToShoppingList = async (
    messageId: string,
  ): Promise<number> => {
    const chatId = currentChatId;
    if (!chatId) return 0;

    const message = currentMessages.find((m) => m.id === messageId);
    const action = message?.agentAction;
    if (!action || action.type !== 'create_recipe') return 0;

    let itemsAdded = 0;
    for (const recipeProposal of action.recipes) {
      for (const ing of recipeProposal.ingredients) {
        try {
          await dispatch(
            createShoppingListItem({
              name: ing.name,
              ingredientId: ing.existingIngredientId ?? null,
              productId: null,
              amount: ing.servings,
              unit: ing.unit,
              category: ing.type,
              note: `For ${recipeProposal.title}`,
              checked: false,
            }),
          ).unwrap();
          itemsAdded++;
        } catch {
          // Continue adding remaining items even if one fails (e.g. duplicates)
        }
      }
    }

    dispatch(
      setRecipeActionShoppingListDecision({
        chatId,
        messageId,
        decision: 'added',
        itemsAdded,
      }),
    );

    return itemsAdded;
  };

  const handleSkipShoppingList = (messageId: string) => {
    const chatId = currentChatId;
    if (!chatId) return;

    dispatch(
      setRecipeActionShoppingListDecision({
        chatId,
        messageId,
        decision: 'skipped',
        itemsAdded: 0,
      }),
    );
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
        content:
          "No problem! The recipe has been discarded. Let me know if you'd like to create a different one.",
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

    const baseMessages = [...currentMessages];
    let existingMessages = [...baseMessages];

    if (editMessageId && currentChatId) {
      dispatch(
        trimMessagesFrom({ chatId: currentChatId, messageId: editMessageId }),
      );

      const trimIndex = baseMessages.findIndex((m) => m.id === editMessageId);
      const trimmedMessages =
        trimIndex !== -1 ? baseMessages.slice(0, trimIndex) : baseMessages;
      existingMessages = trimmedMessages;
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
      iterationInvalid: null,
    };

    // Before creating a new assistant message, check whether the user is refining an
    // existing pending_approval proposal.
    if (currentChatId) {
      const pendingApprovalMsg = existingMessages
        .slice()
        .reverse()
        .find(
          (m) =>
            m.role === 'assistant' &&
            m.agentAction?.type === 'create_recipe' &&
            m.agentAction?.status === 'pending_approval',
        );

      if (
        pendingApprovalMsg?.agentAction?.type === 'create_recipe' &&
        pendingApprovalMsg.agentAction.recipes.length > 0
      ) {
        const allMessagesForIteration = buildIterationContextMessages(
          existingMessages,
          pendingApprovalMsg,
          userMessage,
        );

        dispatch(addMessage({ chatId: currentChatId, message: userMessage }));

        dispatch(
          updateAgentActionStatus({
            chatId: currentChatId,
            messageId: pendingApprovalMsg.id,
            status: 'stale',
          }),
        );

        const iteratingMessageId = generatedId('msg');
        const iteratingMessage: ChatMessageType = {
          id: iteratingMessageId,
          role: 'assistant',
          content: 'Analyzing your request…',
          timestamp: Date.now(),
          model: selectedModel,
          rawContent: null,
          agentAction: {
            type: 'create_recipe',
            status: 'iterating',
            proposedName: pendingApprovalMsg.agentAction.proposedName,
            recipes: [...pendingApprovalMsg.agentAction.recipes],
            recipe: null,
            completedSteps: null,
            updatingFields: null,
            shoppingListDecision: null,
            shoppingListItemsAdded: null,
          },
          summary: null,
          iterationInvalid: null,
        };

        dispatch(
          addMessage({
            chatId: currentChatId,
            message: iteratingMessage,
          }),
        );

        firstTokenReceivedRef.current = true;
        activeChatIdRef.current = currentChatId;
        activeMessageIdRef.current = iteratingMessageId;

        const existingProposal = pendingApprovalMsg.agentAction.recipes[0];

        try {
          const result = await iterateRecipeAction.execute(
            selectedModel,
            {
              messages: allMessagesForIteration,
              previousResults: { existingProposal },
            },
            {
              abortSignal: abortController.signal,
              onStepComplete: (key, data) => {
                if (key === 'validateIterationRequest') {
                  // Show the agent's acknowledgment or refusal immediately in the message text.
                  const agentMsg = data.agentMessage as string;
                  if (agentMsg) {
                    dispatch(
                      updateMessageContent({
                        chatId: currentChatId,
                        messageId: iteratingMessageId,
                        content: agentMsg,
                      }),
                    );
                  }
                } else if (key === 'detectFieldsToUpdate') {
                  const rawFields = data.fieldsToUpdate;
                  const fields: RecipeIterableField[] = Array.isArray(rawFields)
                    ? (rawFields as RecipeIterableField[])
                    : [];
                  if (fields.length > 0) {
                    dispatch(
                      updateAgentActionStatus({
                        chatId: currentChatId,
                        messageId: iteratingMessageId,
                        status: 'iterating',
                        updatingFields: fields,
                      }),
                    );
                  }
                }
              },
            },
          );

          if (result.cancelled) {
            dispatch(
              removeMessage({
                chatId: currentChatId,
                messageId: iteratingMessageId,
              }),
            );

            dispatch(
              updateAgentActionStatus({
                chatId: currentChatId,
                messageId: pendingApprovalMsg.id,
                status: 'pending_approval',
              }),
            );
          } else if (result.data.iterationValid === false) {
            // The user's message wasn't about refining the recipe.
            // The agent's explanation is already in the message content (set via onStepComplete).
            // Remove the iterating action card and restore the original pending_approval proposal.
            const invalidContent = result.data.agentMessage as
              | string
              | undefined;
            if (!invalidContent) {
              console.warn(
                '[iterateRecipeAction] validation returned no agentMessage — using fallback',
              );
            }
            dispatch(
              updateMessageContent({
                chatId: currentChatId,
                messageId: iteratingMessageId,
                content:
                  invalidContent ??
                  "I'm not sure what you'd like to change. Could you clarify?",
                agentAction: null,
              }),
            );

            // Mark the user's message as an invalid iteration so it is excluded
            // from context when building subsequent iteration requests.
            dispatch(
              markMessageIterationInvalid({
                chatId: currentChatId,
                messageId: userMessage.id,
              }),
            );

            dispatch(
              updateAgentActionStatus({
                chatId: currentChatId,
                messageId: pendingApprovalMsg.id,
                status: 'pending_approval',
              }),
            );
          } else {
            const newProposal = result.data.proposal;
            const activeProposal = newProposal ?? existingProposal;

            dispatch(
              updateAgentActionStatus({
                chatId: currentChatId,
                messageId: iteratingMessageId,
                status: 'pending_approval',
                recipes: [activeProposal],
                updatingFields: null,
              }),
            );

            // Use the LLM-generated summary when available so the user gets a specific,
            // natural description of what changed. Fall back to a generic string only if
            // the summary step was skipped (e.g. no fields were updated).
            const iterationSummary = result.data.iterationSummary as
              | string
              | undefined;
            const displayContent =
              iterationSummary ??
              (newProposal
                ? 'I updated the recipe based on your feedback. Review the changes and save when ready.'
                : 'I reviewed your feedback — no recipe changes were detected.');

            dispatch(
              updateMessageContent({
                chatId: currentChatId,
                messageId: iteratingMessageId,
                content: displayContent,
              }),
            );

            // Also store the summary so buildIterationContextMessages can include it
            // in future iteration context — giving the agent awareness of prior changes.
            dispatch(
              updateMessageSummary({
                chatId: currentChatId,
                messageId: iteratingMessageId,
                summary: displayContent,
              }),
            );
          }
        } catch (err) {
          if (!abortController.signal.aborted) {
            addToast({
              title: 'Refinement failed',
              description:
                err instanceof Error
                  ? err.message
                  : 'An unexpected error occurred.',
              type: 'error',
            });
          }

          dispatch(
            removeMessage({
              chatId: currentChatId,
              messageId: iteratingMessageId,
            }),
          );

          dispatch(
            updateAgentActionStatus({
              chatId: currentChatId,
              messageId: pendingApprovalMsg.id,
              status: 'pending_approval',
            }),
          );
        } finally {
          if (abortControllerRef.current === abortController) {
            abortControllerRef.current = null;
            firstTokenReceivedRef.current = false;
            activeChatIdRef.current = null;
            activeMessageIdRef.current = null;
            setIsSending(false);
          }
        }

        return;
      }
    }

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
      iterationInvalid: null,
    };

    let targetChatId: string | null;
    let allMessagesForIntent: ChatMessageType[] = [];

    if (!currentChatId) {
      allMessagesForIntent = [userMessage];

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
      allMessagesForIntent = [...existingMessages, userMessage];
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
      if (useToolCalling) {
        firstTokenReceivedRef.current = true;

        const toolResult = await toolCallAction.execute(
          modelUsed,
          { messages: allMessagesForIntent },
          {
            abortSignal: abortController.signal,
            getState: store.getState,
            dispatch,
            userId: authUser?.uid ?? '',
            onProgress: (content: string) => {
              dispatch(
                updateMessageContent({
                  chatId: chatIdForStream,
                  messageId: assistantMessageId,
                  content,
                }),
              );
            },
            onToolCallStart: (toolCalls: ToolCallResultInfo[]) => {
              dispatch(
                initToolCalls({
                  chatId: chatIdForStream,
                  messageId: assistantMessageId,
                  toolCalls,
                }),
              );
            },
            onToolCallComplete: (index: number, toolResult: ToolCallResultInfo) => {
              dispatch(
                updateToolCallStatus({
                  chatId: chatIdForStream,
                  messageId: assistantMessageId,
                  toolIndex: index,
                  status: toolResult.status,
                  result: toolResult.result,
                }),
              );
            },
          } as ToolCallRuntime,
        );

        if (!abortController.signal.aborted && !toolResult.cancelled) {
          const messageContentUpdates =
            toolCallAction.getUpdatedMessageContentFromResult!(toolResult.data as ToolCallResult);

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
      } else {
        const intent = await detectIntent(modelUsed, allMessagesForIntent);

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
            { messages: allMessagesForIntent },
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
                type: 'create_recipe',
                status: 'pending_confirmation',
                proposedName: proposedName ?? '',
                recipes: [],
                recipe: null,
                completedSteps: null,
                updatingFields: null,
                shoppingListDecision: null,
                shoppingListItemsAdded: null,
              },
            }),
          );
        } else {
          firstTokenReceivedRef.current = true;

          const result = await handler.execute(
            modelUsed,
            { messages: allMessagesForIntent },
            {
              abortSignal: abortController.signal,
              onProgress: (content: string) => {
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

  const ollamaOffline = isMobileWebView || (!ollamaLoading && !!ollamaError);

  if (ollamaOffline) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <div className='max-w-md space-y-6 text-center'>
          <h1 className='text-foreground text-2xl font-bold'>AI Chat requires Ollama</h1>
          <Callout
            variant='info'
            description={
              canInstallOllama
                ? 'Demmi runs on a local AI model via Ollama, which needs to be running on your desktop.'
                : "Demmi's AI runs via Ollama, which needs to be installed on your desktop. Chat isn't available on mobile yet."
            }
          />
          {canInstallOllama && (
            <a
              href='https://ollama.com/download'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block'
            >
              <Button variant='primary'>Download Ollama →</Button>
            </a>
          )}
          {!canInstallOllama && (
            <p className='text-muted-foreground text-sm'>Cloud AI for mobile is coming soon.</p>
          )}
        </div>
      </div>
    );
  }

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

                <div className='bg-border mx-1 h-4 w-px' />

                <Label
                  htmlFor='toggle-tool-calling'
                  className='text-muted-foreground text-sm'
                >
                  Tool calling
                </Label>
                <Toggle
                  id='toggle-tool-calling'
                  checked={useToolCalling}
                  size='sm'
                  onCheckedChange={() => setUseToolCalling((v) => !v)}
                  disabled={isSending}
                  aria-label='Toggle tool calling mode'
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
                  onAddToShoppingList={handleAddToShoppingList}
                  onSkipShoppingList={handleSkipShoppingList}
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
