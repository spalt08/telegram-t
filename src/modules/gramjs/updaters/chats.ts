import { getDispatch, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate } from '../../../api/types';

import { updateChat, replaceChatListIds, updateChatListIds } from '../../reducers';
import { selectChat } from '../../selectors';

const TYPING_STATUS_CLEAR_DELAY = 6000; // 6 seconds

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'updateChat': {
      // Edge case: Chat is old and not yet loaded.
      const { listIds } = global.chats;
      if (!listIds || !listIds.includes(update.id)) {
        getDispatch().loadTopChats();
      } else {
        setGlobal(updateChat(global, update.id, update.chat));
      }

      break;
    }

    case 'updateChatJoin': {
      setGlobal(updateChatListIds(global, [update.id]));
      break;
    }

    case 'updateChatLeave': {
      const { listIds } = global.chats;
      if (listIds) {
        setGlobal(replaceChatListIds(global, listIds.filter((listId) => listId !== update.id)));
      }

      break;
    }

    case 'updateChatInbox': {
      setGlobal(updateChat(global, update.id, update.chat));

      const chat = selectChat(global, update.id);
      if (chat && chat.unread_mention_count) {
        getDispatch().requestChatUpdate({ chatId: chat.id });
      }

      break;
    }

    case 'updateChatTypingStatus': {
      const { id, typingStatus } = update;
      setGlobal(updateChat(global, id, { typingStatus }));

      setTimeout(() => {
        const newGlobal = getGlobal();
        const chat = selectChat(newGlobal, id);
        if (chat && typingStatus && chat.typingStatus && chat.typingStatus.timestamp === typingStatus.timestamp) {
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
        ...(update.message.hasMention && {
          unread_mention_count: chat.unread_mention_count ? chat.unread_mention_count + 1 : 1,
        }),
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

    case 'updateChatMembers': {
      const targetChat = global.chats.byId[update.id];
      const { replacedMembers, addedMember, deletedMemberId } = update;
      if (!targetChat) {
        return;
      }

      let shouldUpdate = false;
      let members = targetChat.full_info && targetChat.full_info.members
        ? [...targetChat.full_info.members]
        : [];

      if (replacedMembers) {
        members = replacedMembers;
        shouldUpdate = true;
      } else if (addedMember) {
        if (
          !members.length
          || !members.some((m) => m.user_id === addedMember.user_id)
        ) {
          members.push(addedMember);
          shouldUpdate = true;
        }
      } else if (members.length && deletedMemberId) {
        const deleteIndex = members.findIndex((m) => m.user_id === deletedMemberId);
        if (deleteIndex > -1) {
          members.slice(deleteIndex, 1);
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        setGlobal(updateChat(global, update.id, {
          members_count: members.length,
          full_info: {
            members,
          },
        }));
      }

      break;
    }
  }
}
