import { getDispatch, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate, ApiMessage } from '../../../api/types';
import { updateChat, deleteChatMessages, updateChatMessage } from '../../reducers';
import { GlobalState } from '../../../store/types';
import { selectChat, selectChatMessage, selectChatMessages } from '../../selectors';
import { getMessageKey, getMessagePhoto } from '../../helpers';

const DELETING_DELAY = 200;

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'newMessage': {
      const { chat_id, id, message } = update;

      // Preserve HD thumbnail for uploaded photos.
      const currentMessage = selectChatMessage(global, chat_id, id);
      const currentPhoto = currentMessage && getMessagePhoto(currentMessage);
      if (currentPhoto && message.content && message.content.photo) {
        message.content.photo.thumbnail = currentPhoto.thumbnail;
      }

      let newGlobal = updateChatMessage(global, chat_id, id, message);

      const chat = selectChat(global, chat_id);

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

      if (!selectChatMessage(global, chat_id, id)) {
        return;
      }

      let newGlobal = updateChatMessage(global, chat_id, id, message);

      const newMessage = selectChatMessage(newGlobal, chat_id, id)!;
      newGlobal = updateChatLastMessage(newGlobal, chat_id, newMessage);

      setGlobal(newGlobal);

      break;
    }

    case 'updateMessageSendSucceeded': {
      const { chat_id, old_message_id, message } = update;

      let newGlobal = updateChatMessage(global, chat_id, message.id, {
        ...selectChatMessage(global, chat_id, old_message_id),
        ...message,
      });
      newGlobal = deleteChatMessages(newGlobal, chat_id, [old_message_id]);

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
          newGlobal = updateChatMessage(global, chat_id, id, {
            is_deleting: true,
          });

          const newLastMessage = findLastMessage(newGlobal, chat_id, id);
          if (newLastMessage) {
            newGlobal = updateChatLastMessage(newGlobal, chat_id, newLastMessage, true);
          }
        });

        setGlobal(newGlobal);

        scheduleDeleting(chat_id, ids);

        return;
      }

      ids.forEach((id) => {
        const chatId = findChatId(global, id);
        if (chatId) {
          newGlobal = updateChatMessage(newGlobal, chatId, id, {
            is_deleting: true,
          });

          const newLastMessage = findLastMessage(newGlobal, chatId, id);
          if (newLastMessage) {
            newGlobal = updateChatLastMessage(newGlobal, chatId, newLastMessage, true);
          }

          scheduleDeleting(chatId, [id]);
        }
      });

      setGlobal(newGlobal);

      break;
    }

    case 'updateFileUploadProgress': {
      const { chat_id, message_id, progress } = update;

      setGlobal({
        ...global,
        fileTransfers: {
          byMessageKey: {
            ...global.fileTransfers.byMessageKey,
            [getMessageKey(chat_id, message_id)]: { progress },
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

// The animation will start in two frames (TeactN `runCallbacks` + Teact `forceUpdate`), so should the timeout.
function scheduleDeleting(chatId: number, messageIds: number[]) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        setGlobal(deleteChatMessages(getGlobal(), chatId, messageIds));
      }, DELETING_DELAY);
    });
  });
}
