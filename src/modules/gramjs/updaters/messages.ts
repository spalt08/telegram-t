import { getDispatch, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate, ApiMessage, PollAnswerVote } from '../../../api/types';
import {
  updateChat,
  deleteChatMessages,
  updateChatMessage,
  updateListedIds,
  addViewportId,
} from '../../reducers';
import { GlobalState } from '../../../global/types';
import {
  selectChat, selectChatMessage, selectChatMessages, selectIsViewportNewest, selectListedIds, selectChatMessageByPollId,
} from '../../selectors';
import { getMessageContent, isCommonBoxChat } from '../../helpers';

const ANIMATION_DELAY = 350;

function updateMessageAndPreserveMedia(global: GlobalState, chat_id: number, id: number, message: Partial<ApiMessage>) {
  // Preserve locally uploaded media.
  const currentMessage = selectChatMessage(global, chat_id, id);
  if (currentMessage && message.content) {
    const { photo, video, sticker } = getMessageContent(currentMessage);
    if (photo && message.content.photo) {
      message.content.photo.blobUrl = photo.blobUrl;
      message.content.photo.thumbnail = photo.thumbnail;
    } else if (video && message.content.video) {
      message.content.video.blobUrl = video.blobUrl;
    } else if (sticker && message.content.sticker) {
      message.content.sticker.localMediaHash = sticker.localMediaHash;
    }
  }

  return updateChatMessage(global, chat_id, id, message);
}

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'newMessage': {
      const { chat_id, id, message } = update;
      let newGlobal = global;

      newGlobal = updateMessageAndPreserveMedia(newGlobal, chat_id, id, message);
      newGlobal = updateListedIds(newGlobal, chat_id, [id]);
      if (selectIsViewportNewest(newGlobal, chat_id)) {
        newGlobal = addViewportId(newGlobal, chat_id, id);
      }

      const chat = selectChat(newGlobal, chat_id);
      if (chat) {
        const newMessage = selectChatMessage(newGlobal, chat_id, id)!;
        newGlobal = updateChatLastMessage(newGlobal, chat_id, newMessage);
      }

      setGlobal(newGlobal);

      // Edge case: New message in an old (not loaded) chat.
      const { listIds } = newGlobal.chats;
      if (!listIds || !listIds.includes(chat_id)) {
        getDispatch().loadTopChats();
      }

      break;
    }

    case 'editMessage': {
      const { chat_id, id, message } = update;

      const currentMessage = selectChatMessage(global, chat_id, id);
      if (!currentMessage) {
        return;
      }

      let newGlobal = global;
      newGlobal = updateMessageAndPreserveMedia(newGlobal, chat_id, id, message);

      const newMessage = selectChatMessage(newGlobal, chat_id, id)!;
      newGlobal = updateChatLastMessage(newGlobal, chat_id, newMessage);

      setGlobal(newGlobal);

      break;
    }

    case 'updateMessageSendSucceeded': {
      const { chat_id, local_id, message } = update;

      let newGlobal = global;

      newGlobal = updateListedIds(newGlobal, chat_id, [message.id]);
      if (selectIsViewportNewest(newGlobal, chat_id)) {
        newGlobal = addViewportId(newGlobal, chat_id, message.id);
      }

      newGlobal = updateChatMessage(newGlobal, chat_id, message.id, {
        ...selectChatMessage(newGlobal, chat_id, local_id),
        ...message,
        prev_local_id: local_id,
      });
      newGlobal = deleteChatMessages(newGlobal, chat_id, [local_id]);

      const newMessage = selectChatMessage(newGlobal, chat_id, message.id)!;
      newGlobal = updateChatLastMessage(newGlobal, chat_id, newMessage);

      setGlobal(newGlobal);

      break;
    }

    case 'deleteMessages': {
      const { ids, chat_id } = update;

      let newGlobal = global;

      // Channel update.
      if (chat_id) {
        ids.forEach((id) => {
          newGlobal = updateChatMessage(newGlobal, chat_id, id, {
            is_deleting: true,
          });

          const newLastMessage = findLastMessage(newGlobal, chat_id);
          if (newLastMessage) {
            newGlobal = updateChatLastMessage(newGlobal, chat_id, newLastMessage, true);
          }
        });

        setGlobal(newGlobal);

        getDispatch().requestChatUpdate({ chatId: chat_id });

        setTimeout(() => {
          setGlobal(deleteChatMessages(getGlobal(), chat_id, ids));
        }, ANIMATION_DELAY);

        return;
      }

      const chatIds: number[] = [];

      ids.forEach((id) => {
        const chatId = findCommonBoxChatId(newGlobal, id);
        if (chatId) {
          chatIds.push(chatId);

          newGlobal = updateChatMessage(newGlobal, chatId, id, {
            is_deleting: true,
          });

          const newLastMessage = findLastMessage(newGlobal, chatId);
          if (newLastMessage) {
            newGlobal = updateChatLastMessage(newGlobal, chatId, newLastMessage, true);
          }

          setTimeout(() => {
            setGlobal(deleteChatMessages(getGlobal(), chatId, [id]));
          }, ANIMATION_DELAY);
        }
      });

      setGlobal(newGlobal);

      chatIds.forEach((chatId) => {
        getDispatch().requestChatUpdate({ chatId });
      });

      break;
    }

    case 'updateCommonBoxMessages': {
      const { ids, messageUpdate } = update;

      let newGlobal = global;

      ids.forEach((id) => {
        const chatId = findCommonBoxChatId(newGlobal, id);
        if (chatId) {
          newGlobal = updateChatMessage(newGlobal, chatId, id, messageUpdate);
        }
      });

      setGlobal(newGlobal);

      break;
    }

    case 'updateMessagePoll': {
      const { pollId, pollUpdate } = update;

      const message = selectChatMessageByPollId(global, pollId);

      if (message && message.content.poll) {
        const updatedPoll = { ...message.content.poll, ...pollUpdate };

        // Workaround for poll update bug: `chosen` option gets reset when someone votes after current user
        const { results: updatedResults } = updatedPoll.results || {};
        if (updatedResults && !updatedResults.some(((result) => result.chosen))) {
          const { results } = message.content.poll.results;
          const chosenAnswer = results && results.find((result) => result.chosen);
          const chosenAnswerIndex = chosenAnswer
            ? updatedResults.findIndex((result) => result.option === chosenAnswer.option)
            : -1;
          if (chosenAnswerIndex >= 0) {
            updatedPoll.results.results![chosenAnswerIndex].chosen = true;
          }
        }

        setGlobal(updateChatMessage(
          global,
          message.chat_id,
          message.id,
          {
            content: {
              ...message.content,
              poll: updatedPoll,
            },
          },
        ));
      }
      break;
    }

    case 'updateMessagePollVote': {
      const { pollId, userId, options } = update;
      const message = selectChatMessageByPollId(global, pollId);
      if (!message || !message.content.poll || !message.content.poll.results) {
        break;
      }

      const { poll } = message.content;

      const { recentVoters, totalVoters, results } = poll.results;
      const newRecentVoters = recentVoters ? [...recentVoters] : [];
      const newTotalVoters = totalVoters ? totalVoters + 1 : 1;
      const newResults = results ? [...results] : [];

      newRecentVoters.push(userId);

      options.forEach((option) => {
        const targetOption = newResults.find((result) => result.option === option);
        const targetOptionIndex = newResults.findIndex((result) => result.option === option);
        const updatedOption: PollAnswerVote = targetOption ? { ...targetOption } : { option, voters: 0 };

        updatedOption.voters += 1;
        if (userId === global.currentUserId) {
          updatedOption.chosen = true;
        }

        if (targetOptionIndex) {
          newResults[targetOptionIndex] = updatedOption;
        } else {
          newResults.push(updatedOption);
        }
      });

      setGlobal(updateChatMessage(
        global,
        message.chat_id,
        message.id,
        {
          content: {
            ...message.content,
            poll: {
              ...poll,
              results: {
                ...poll.results,
                recentVoters: newRecentVoters,
                totalVoters: newTotalVoters,
                results: newResults,
              },
            },
          },
        },
      ));

      break;
    }
  }
}

function updateChatLastMessage(
  global: GlobalState,
  chatId: number,
  message: ApiMessage,
  force = false,
) {
  const { chats } = global;
  const currentLastMessage = chats.byId[chatId] && chats.byId[chatId].last_message;

  if (currentLastMessage && !force) {
    // TODO @refactoring Use 1e9+ for local IDs instead of 0-
    const isNewer = (
      currentLastMessage.id === message.id || currentLastMessage.id === message.prev_local_id
    ) || (
      currentLastMessage.id < 0 && message.id < currentLastMessage.id
    ) || (
      currentLastMessage.id >= 0 && (
        message.id < 0 || message.id > currentLastMessage.id
      )
    );

    if (!isNewer) {
      return global;
    }
  }

  return updateChat(global, chatId, { last_message: message });
}

function findCommonBoxChatId(global: GlobalState, messageId: number) {
  const fromLastMessage = Object.values(global.chats.byId).find((chat) => (
    isCommonBoxChat(chat) && chat.last_message && chat.last_message.id === messageId
  ));
  if (fromLastMessage) {
    return fromLastMessage.id;
  }

  const { byChatId } = global.messages;
  return Number(Object.keys(byChatId).find((chatId) => {
    const chat = selectChat(global, Number(chatId));
    return isCommonBoxChat(chat) && byChatId[chat.id].byId[messageId];
  }));
}

function findLastMessage(global: GlobalState, chatId: number) {
  const byId = selectChatMessages(global, chatId);
  const listedIds = selectListedIds(global, chatId);

  if (!byId || !listedIds) {
    return undefined;
  }

  let i = listedIds.length;
  while (i--) {
    const message = byId[listedIds[i]];
    if (!message.is_deleting) {
      return message;
    }
  }

  return undefined;
}
