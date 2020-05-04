import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate } from '../../../api/types';

import {
  updateChat,
  replaceChatListIds,
  updateChatListIds,
  updateSelectedChatId,
} from '../../reducers';
import { selectChat, selectCommonBoxChatId } from '../../selectors';

const TYPING_STATUS_CLEAR_DELAY = 6000; // 6 seconds

addReducer('apiUpdate', (global, actions, update: ApiUpdate) => {
  switch (update['@type']) {
    case 'updateChat': {
      const { listIds } = global.chats;
      if (!listIds || !listIds.includes(update.id)) {
        // Chat can appear in dialogs list.
        actions.loadTopChats();
      }

      setGlobal(updateChat(global, update.id, update.chat));

      break;
    }

    case 'updateChatJoin': {
      setGlobal(updateChatListIds(global, [update.id]));
      break;
    }

    case 'updateChatLeave': {
      const { listIds } = global.chats;

      if (listIds) {
        let newGlobal = global;
        newGlobal = replaceChatListIds(newGlobal, listIds.filter((listId) => listId !== update.id));
        const { selectedId } = newGlobal.chats;
        if (selectedId === update.id) {
          newGlobal = updateSelectedChatId(newGlobal, undefined);
        }
        setGlobal(newGlobal);
      }

      break;
    }

    case 'updateChatInbox': {
      setGlobal(updateChat(global, update.id, update.chat));

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
      if (update.message.isOutgoing) {
        return;
      }

      const chat = selectChat(global, update.chatId);
      if (!chat) {
        return;
      }

      setGlobal(updateChat(global, update.chatId, {
        unreadCount: chat.unreadCount ? chat.unreadCount + 1 : 1,
        ...(update.message.hasUnreadMention && {
          unreadMentionsCount: chat.unreadMentionsCount ? chat.unreadMentionsCount + 1 : 1,
        }),
      }));

      break;
    }

    case 'updateCommonBoxMessages':
    case 'updateChannelMessages': {
      const { ids, messageUpdate } = update;
      if (messageUpdate.hasUnreadMention !== false) {
        return;
      }

      let newGlobal = global;

      ids.forEach((id) => {
        const chatId = 'channelId' in update ? update.channelId : selectCommonBoxChatId(newGlobal, id);
        const chat = selectChat(newGlobal, chatId);
        if (chat && chat.unreadMentionsCount) {
          newGlobal = updateChat(newGlobal, chatId, {
            unreadMentionsCount: chat.unreadMentionsCount - 1,
          });
        }
      });

      setGlobal(newGlobal);

      break;
    }

    case 'updateChatFullInfo': {
      const { fullInfo } = update;
      const targetChat = global.chats.byId[update.id];
      if (!targetChat) {
        return;
      }

      setGlobal(updateChat(global, update.id, {
        fullInfo: {
          ...targetChat.fullInfo,
          ...fullInfo,
        },
      }));

      break;
    }

    case 'updatePinnedChatIds': {
      const { ids } = update;
      const allChats = Object.values(global.chats.byId);

      let newGlobal = global;

      allChats.forEach((chat) => {
        if (!chat.isPinned && ids.includes(chat.id)) {
          newGlobal = updateChat(newGlobal, chat.id, { isPinned: true });
        } else if (chat.isPinned && !ids.includes(chat.id)) {
          newGlobal = updateChat(newGlobal, chat.id, { isPinned: false });
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
      let members = targetChat.fullInfo && targetChat.fullInfo.members
        ? [...targetChat.fullInfo.members]
        : [];

      if (replacedMembers) {
        members = replacedMembers;
        shouldUpdate = true;
      } else if (addedMember) {
        if (
          !members.length
          || !members.some((m) => m.userId === addedMember.userId)
        ) {
          members.push(addedMember);
          shouldUpdate = true;
        }
      } else if (members.length && deletedMemberId) {
        const deleteIndex = members.findIndex((m) => m.userId === deletedMemberId);
        if (deleteIndex > -1) {
          members.slice(deleteIndex, 1);
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        setGlobal(updateChat(global, update.id, {
          membersCount: members.length,
          fullInfo: {
            members,
          },
        }));
      }

      break;
    }
  }
});
