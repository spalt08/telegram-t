import { getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate } from '../../../api/types';

import { updateChat } from '../../reducers';
import { selectChat } from '../../selectors';

const TYPING_STATUS_CLEAR_DELAY = 6000; // 6 seconds

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'updateChat': {
      setGlobal(updateChat(global, update.id, update.chat));

      break;
    }

    case 'updateChatTypingStatus': {
      const { id, typingStatus } = update;
      setGlobal(updateChat(global, id, { typingStatus }));

      setTimeout(() => {
        const newGlobal = getGlobal();
        const chat = selectChat(newGlobal, id);
        if (typingStatus && chat.typingStatus && chat.typingStatus.timestamp === typingStatus.timestamp) {
          setGlobal(updateChat(newGlobal, id, { typingStatus: undefined }));
        }
      }, TYPING_STATUS_CLEAR_DELAY);

      break;
    }

    case 'newMessage': {
      if (update.message.is_outgoing) {
        return;
      }

      const chat = selectChat(global, update.chat_id);
      if (!chat) {
        return;
      }

      setGlobal(updateChat(global, update.chat_id, {
        unread_count: chat.unread_count ? chat.unread_count + 1 : 1,
      }));

      break;
    }

    case 'updateChatFullInfo': {
      const { full_info } = update;
      const targetChat = global.chats.byId[update.id];
      if (!targetChat) {
        return;
      }

      setGlobal(updateChat(global, update.id, {
        full_info: {
          ...targetChat.full_info,
          ...full_info,
        },
      }));

      break;
    }

    case 'updatePinnedChatIds': {
      const { ids } = update;
      const allChats = Object.values(global.chats.byId);

      let newGlobal = global;

      allChats.forEach((chat) => {
        if (!chat.is_pinned && ids.includes(chat.id)) {
          newGlobal = updateChat(newGlobal, chat.id, { is_pinned: true });
        } else if (chat.is_pinned && !ids.includes(chat.id)) {
          newGlobal = updateChat(newGlobal, chat.id, { is_pinned: false });
        }
      });

      newGlobal = {
        ...newGlobal,
        chats: {
          ...newGlobal.chats,
          orderedPinnedIds: ids,
        },
      };

      setGlobal(newGlobal);

      break;
    }
  }
}
