import { getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate, ApiMessage } from '../../../api/types';
import { updateChat } from '../../common/chats';
import { deleteMessages, updateMessage } from '../../common/messages';
import { GlobalState } from '../../../store/types';
import { selectChatMessage, selectChatMessages } from '../../selectors';

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'newMessage': {
      const { chat_id, id, message } = update;

      let newGlobal = updateMessage(global, chat_id, id, message);

      const newMessage = selectChatMessage(newGlobal, chat_id, id)!;
      newGlobal = updateChatLastMessage(newGlobal, chat_id, newMessage);

      setGlobal(newGlobal);

      break;
    }

    case 'editMessage': {
      const { chat_id, id, message } = update;

      if (!selectChatMessage(global, chat_id, id)) {
        return;
      }

      let newGlobal = updateMessage(global, chat_id, id, message);

      const newMessage = selectChatMessage(newGlobal, chat_id, id)!;
      newGlobal = updateChatLastMessage(newGlobal, chat_id, newMessage);

      setGlobal(newGlobal);

      break;
    }

    case 'updateMessageSendSucceeded': {
      const { chat_id, old_message_id, message } = update;

      let newGlobal = updateMessage(global, chat_id, message.id, {
        ...selectChatMessage(global, chat_id, old_message_id),
        ...message,
      });
      newGlobal = deleteMessages(newGlobal, chat_id, [old_message_id]);

      const newMessage = selectChatMessage(newGlobal, chat_id, message.id)!;
      newGlobal = updateChatLastMessage(newGlobal, chat_id, newMessage);

      setGlobal(newGlobal);

      break;
    }

    case 'deleteMessages': {
      const { ids, chat_id } = update;

      // Channel update.
      if (chat_id) {
        let newGlobal = deleteMessages(global, chat_id, ids);

        const newLastMessage = findMessageWithMaxId(newGlobal, chat_id);
        if (newLastMessage) {
          newGlobal = updateChatLastMessage(newGlobal, chat_id, newLastMessage, true);
        }

        setGlobal(newGlobal);

        return;
      }

      let newGlobal = global;
      ids.forEach((id) => {
        const chatId = findChatId(global, id);
        if (chatId) {
          newGlobal = deleteMessages(newGlobal, chatId, [id]);

          const newLastMessage = findMessageWithMaxId(newGlobal, chatId);
          if (newLastMessage) {
            newGlobal = updateChatLastMessage(newGlobal, chatId, newLastMessage, true);
          }
        }
      });

      setGlobal(newGlobal);

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

function findMessageWithMaxId(global: GlobalState, chatId: number) {
  const byId = selectChatMessages(global, chatId);

  if (!byId) {
    return null;
  }

  const maxId = Math.max(...Object.keys(byId).map(Number));
  return byId[maxId];
}
