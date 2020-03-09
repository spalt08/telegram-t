import { getDispatch, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate, ApiMessage } from '../../../api/types';
import {
  updateChat,
  deleteChatMessages,
  updateChatMessage,
  updateListedIds,
  updateViewportIds,
} from '../../reducers';
import { GlobalState } from '../../../global/types';
import {
  selectChat, selectChatMessage, selectChatMessages, selectIsViewportNewest, selectListedIds,
} from '../../selectors';
import { getMessageKey, getMessageContent, isCommonBoxChat } from '../../helpers';

const ANIMATION_DELAY = 300;

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'newMessage': {
      const { chat_id, id, message } = update;

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

      let newGlobal = global;
      newGlobal = updateChatMessage(newGlobal, chat_id, id, message);
      if (selectIsViewportNewest(newGlobal, chat_id)) {
        newGlobal = updateViewportIds(newGlobal, chat_id, [id]);
      }
      newGlobal = updateListedIds(newGlobal, chat_id, [id]);

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

      if (selectIsViewportNewest(newGlobal, chat_id)) {
        newGlobal = updateViewportIds(newGlobal, chat_id, [message.id]);
      }
      newGlobal = updateListedIds(newGlobal, chat_id, [message.id]);

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
        let isMissingLastMessage = false;

        ids.forEach((id) => {
          newGlobal = updateChatMessage(newGlobal, chat_id, id, {
            is_deleting: true,
          });

          const newLastMessage = findLastMessage(newGlobal, chat_id);
          if (newLastMessage) {
            newGlobal = updateChatLastMessage(newGlobal, chat_id, newLastMessage, true);
          } else {
            isMissingLastMessage = true;
          }
        });

        setGlobal(newGlobal);

        if (isMissingLastMessage) {
          getDispatch().requestChatUpdate({ chatId: chat_id });
        }

        setTimeout(() => {
          setGlobal(deleteChatMessages(getGlobal(), chat_id, ids));
        }, ANIMATION_DELAY);

        return;
      }

      const missingLastMessageChatIds: number[] = [];

      ids.forEach((id) => {
        const chatId = findCommonBoxChatId(newGlobal, id);
        if (chatId) {
          newGlobal = updateChatMessage(newGlobal, chatId, id, {
            is_deleting: true,
          });

          const newLastMessage = findLastMessage(newGlobal, chatId);
          if (newLastMessage) {
            newGlobal = updateChatLastMessage(newGlobal, chatId, newLastMessage, true);
          } else {
            missingLastMessageChatIds.push(chatId);
          }

          setTimeout(() => {
            setGlobal(deleteChatMessages(getGlobal(), chatId, [id]));
          }, ANIMATION_DELAY);
        }
      });

      setGlobal(newGlobal);

      missingLastMessageChatIds.forEach((chatId) => {
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
