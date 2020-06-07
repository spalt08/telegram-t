import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate, ApiMessage, PollAnswerVote } from '../../../api/types';
import {
  updateChat,
  deleteChatMessages,
  updateChatMessage,
  updateListedIds,
  addViewportId,
} from '../../reducers';
import { GlobalActions, GlobalState } from '../../../global/types';
import {
  selectChat,
  selectChatMessage,
  selectChatMessages,
  selectIsViewportNewest,
  selectListedIds,
  selectChatMessageByPollId,
  selectCommonBoxChatId,
} from '../../selectors';
import { getMessageContent } from '../../helpers';

const ANIMATION_DELAY = 350;

addReducer('apiUpdate', (global, actions, update: ApiUpdate) => {
  switch (update['@type']) {
    case 'newMessage': {
      const { chatId, id, message } = update;
      let newGlobal = global;

      newGlobal = updateWithLocalMedia(newGlobal, chatId, id, message);
      newGlobal = updateListedIds(newGlobal, chatId, [id]);
      if (selectIsViewportNewest(newGlobal, chatId)) {
        newGlobal = addViewportId(newGlobal, chatId, id);
      }

      const chat = selectChat(newGlobal, chatId);
      if (chat) {
        const newMessage = selectChatMessage(newGlobal, chatId, id)!;
        newGlobal = updateChatLastMessage(newGlobal, chatId, newMessage);
      }

      setGlobal(newGlobal);

      if (chatId === global.chats.selectedId && message.isOutgoing) {
        actions.focusLastMessage();
      }

      // Edge case: New message in an old (not loaded) chat.
      const { listIds } = newGlobal.chats;
      if (!listIds || !listIds.includes(chatId)) {
        actions.loadTopChats();
      }

      break;
    }

    case 'updateMessage': {
      const { chatId, id, message } = update;

      const currentMessage = selectChatMessage(global, chatId, id);
      if (!currentMessage) {
        return;
      }

      let newGlobal = global;
      newGlobal = updateWithLocalMedia(newGlobal, chatId, id, message);

      const newMessage = selectChatMessage(newGlobal, chatId, id)!;
      newGlobal = updateChatLastMessage(newGlobal, chatId, newMessage);

      setGlobal(newGlobal);

      break;
    }

    case 'updateMessageSendSucceeded': {
      const { chatId, localId, message } = update;

      let newGlobal = global;

      newGlobal = updateListedIds(newGlobal, chatId, [message.id]);
      if (selectIsViewportNewest(newGlobal, chatId)) {
        newGlobal = addViewportId(newGlobal, chatId, message.id);
      }

      newGlobal = updateChatMessage(newGlobal, chatId, message.id, {
        ...selectChatMessage(newGlobal, chatId, localId),
        ...message,
        previousLocalId: localId,
      });
      newGlobal = deleteChatMessages(newGlobal, chatId, [localId]);

      const newMessage = selectChatMessage(newGlobal, chatId, message.id)!;
      newGlobal = updateChatLastMessage(newGlobal, chatId, newMessage);

      setGlobal(newGlobal);

      break;
    }

    case 'deleteMessages': {
      const { ids, chatId } = update;

      deleteMessages(chatId, ids, actions, global);
      break;
    }

    case 'deleteHistory': {
      const { chatId } = update;
      const ids = Object.keys(global.messages.byChatId[chatId].byId).map(Number);

      deleteMessages(chatId, ids, actions, global);
      break;
    }

    case 'updateCommonBoxMessages': {
      const { ids, messageUpdate } = update;

      let newGlobal = global;

      ids.forEach((id) => {
        const chatId = selectCommonBoxChatId(newGlobal, id);
        if (chatId) {
          newGlobal = updateChatMessage(newGlobal, chatId, id, messageUpdate);
        }
      });

      setGlobal(newGlobal);

      break;
    }

    case 'updateChannelMessages': {
      const { channelId, ids, messageUpdate } = update;

      let newGlobal = global;

      ids.forEach((id) => {
        newGlobal = updateChatMessage(newGlobal, channelId, id, messageUpdate);
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
          message.chatId,
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
        message.chatId,
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
});

function updateWithLocalMedia(global: GlobalState, chatId: number, id: number, message: Partial<ApiMessage>) {
  // Preserve locally uploaded media.
  const currentMessage = selectChatMessage(global, chatId, id);
  if (currentMessage && message.content) {
    const {
      photo, video, sticker, document,
    } = getMessageContent(currentMessage);
    if (photo && message.content.photo) {
      message.content.photo.blobUrl = photo.blobUrl;
      message.content.photo.thumbnail = photo.thumbnail;
    } else if (video && message.content.video) {
      message.content.video.blobUrl = video.blobUrl;
    } else if (sticker && message.content.sticker) {
      message.content.sticker.localMediaHash = sticker.localMediaHash;
    } else if (document && message.content.document) {
      message.content.document.previewBlobUrl = document.previewBlobUrl;
    }
  }

  return updateChatMessage(global, chatId, id, message);
}

function updateChatLastMessage(
  global: GlobalState,
  chatId: number,
  message: ApiMessage,
  force = false,
) {
  const { chats } = global;
  const currentLastMessage = chats.byId[chatId] && chats.byId[chatId].lastMessage;

  if (currentLastMessage && !force) {
    const isSameOrNewer = (
      currentLastMessage.id === message.id || currentLastMessage.id === message.previousLocalId
    ) || message.id > currentLastMessage.id;

    if (!isSameOrNewer) {
      return global;
    }
  }

  return updateChat(global, chatId, { lastMessage: message });
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
    if (!message.isDeleting) {
      return message;
    }
  }

  return undefined;
}

function deleteMessages(chatId: number|undefined, ids: number[], actions: GlobalActions, newGlobal: GlobalState) {
  // Channel update.
  if (chatId) {
    ids.forEach((id) => {
      newGlobal = updateChatMessage(newGlobal, chatId, id, {
        isDeleting: true,
      });

      const newLastMessage = findLastMessage(newGlobal, chatId);
      if (newLastMessage) {
        newGlobal = updateChatLastMessage(newGlobal, chatId, newLastMessage, true);
      }
    });

    setGlobal(newGlobal);

    actions.requestChatUpdate({ chatId });

    setTimeout(() => {
      setGlobal(deleteChatMessages(getGlobal(), chatId, ids));
    }, ANIMATION_DELAY);

    return;
  }

  const commonBoxChatIds: number[] = [];

  ids.forEach((id) => {
    const commonBoxChatId = selectCommonBoxChatId(newGlobal, id);
    if (commonBoxChatId) {
      commonBoxChatIds.push(commonBoxChatId);

      newGlobal = updateChatMessage(newGlobal, commonBoxChatId, id, {
        isDeleting: true,
      });

      const newLastMessage = findLastMessage(newGlobal, commonBoxChatId);
      if (newLastMessage) {
        newGlobal = updateChatLastMessage(newGlobal, commonBoxChatId, newLastMessage, true);
      }

      setTimeout(() => {
        setGlobal(deleteChatMessages(getGlobal(), commonBoxChatId, [id]));
      }, ANIMATION_DELAY);
    }
  });

  setGlobal(newGlobal);

  commonBoxChatIds.forEach((commonBoxChatId) => {
    actions.requestChatUpdate({ chatId: commonBoxChatId });
  });
}
