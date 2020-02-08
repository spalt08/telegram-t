import { getDispatch, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate, ApiMessage } from '../../../api/types';
import {
  updateChat, deleteChatMessages, updateChatMessage, updateChatMessageListedIds,
} from '../../reducers';
import { GlobalState } from '../../../store/types';
import { selectChat, selectChatMessage, selectChatMessages } from '../../selectors';
import { getMessageKey, getMessagePhoto, getMessageVideo } from '../../helpers';

const ANIMATION_DELAY = 300;

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'newMessage': {
      const { chat_id, id, message } = update;

      // Preserve local blob URL uploaded media.
      const currentMessage = selectChatMessage(global, chat_id, id);
      const currentPhotoOrVideo = currentMessage && (
        getMessagePhoto(currentMessage) || getMessageVideo(currentMessage)
      );
      if (currentPhotoOrVideo && message.content) {
        if (message.content.photo) {
          message.content.photo.blobUrl = currentPhotoOrVideo.blobUrl;
          message.content.photo.thumbnail = currentPhotoOrVideo.thumbnail;
        } else if (message.content.video) {
          message.content.video.blobUrl = currentPhotoOrVideo.blobUrl;
        }
      }

      let newGlobal = global;
      newGlobal = updateChatMessage(newGlobal, chat_id, id, message);
      newGlobal = updateChatMessageListedIds(newGlobal, chat_id, [id]);

      const chat = selectChat(newGlobal, chat_id);

      if (chat) {
        const newMessage = selectChatMessage(newGlobal, chat_id, id)!;
        newGlobal = updateChatLastMessage(newGlobal, chat_id, newMessage);
      }

      setGlobal(newGlobal);

      // Edge case: New message in an old (not loaded) chat.
      if (!chat) {
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
      newGlobal = updateChatMessage(newGlobal, chat_id, id, message);

      const newMessage = selectChatMessage(newGlobal, chat_id, id)!;
      newGlobal = updateChatLastMessage(newGlobal, chat_id, newMessage);

      setGlobal(newGlobal);

      break;
    }

    case 'updateMessageSendSucceeded': {
      const { chat_id, local_id, message } = update;

      let newGlobal = global;
      newGlobal = updateChatMessage(newGlobal, chat_id, message.id, {
        ...selectChatMessage(newGlobal, chat_id, local_id),
        ...message,
        prev_local_id: local_id,
      });
      newGlobal = deleteChatMessages(newGlobal, chat_id, [local_id]);
      newGlobal = updateChatMessageListedIds(newGlobal, chat_id, [message.id]);

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

          const newLastMessage = findLastMessage(newGlobal, chat_id, id);
          if (newLastMessage) {
            newGlobal = updateChatLastMessage(newGlobal, chat_id, newLastMessage, true);
          }
        });

        setGlobal(newGlobal);

        setTimeout(() => {
          setGlobal(deleteChatMessages(getGlobal(), chat_id, ids));
        }, ANIMATION_DELAY);

        return;
      }

      ids.forEach((id) => {
        const chatId = findChatId(newGlobal, id);
        if (chatId) {
          newGlobal = updateChatMessage(newGlobal, chatId, id, {
            is_deleting: true,
          });

          const newLastMessage = findLastMessage(newGlobal, chatId, id);
          if (newLastMessage) {
            newGlobal = updateChatLastMessage(newGlobal, chatId, newLastMessage, true);
          }

          setTimeout(() => {
            setGlobal(deleteChatMessages(getGlobal(), chatId, [id]));
          }, ANIMATION_DELAY);
        }
      });

      setGlobal(newGlobal);

      break;
    }

    case 'updateFileUploadProgress': {
      const { chat_id, message_id, progress } = update;
      const messageKey = getMessageKey(chat_id, message_id);

      setGlobal({
        ...global,
        fileTransfers: {
          byMessageKey: {
            ...global.fileTransfers.byMessageKey,
            [messageKey]: { progress },
          },
        },
      });

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

  if (!currentLastMessage || message.id >= currentLastMessage.id || force) {
    return updateChat(global, chatId, { last_message: message });
  }

  return global;
}

function findChatId(global: GlobalState, messageId: number) {
  const { byChatId } = global.messages;

  return Number(Object.keys(byChatId).find((chatId) => {
    return messageId in byChatId[Number(chatId)].byId;
  }));
}

function findLastMessage(global: GlobalState, chatId: number, exceptForId: number) {
  const byId = selectChatMessages(global, chatId);

  if (!byId) {
    return null;
  }

  const ids = Object.keys(byId).map(Number);
  const lastId = ids[ids.length - 1];

  return byId[lastId !== exceptForId ? lastId : ids[ids.length - 2]];
}
