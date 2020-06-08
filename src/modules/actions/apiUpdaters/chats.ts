import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate } from '../../../api/types';

import {
  updateChat,
  replaceChatListIds,
  updateChatListIds,
  updateChatFolder,
} from '../../reducers';
import {
  selectChat,
  selectCommonBoxChatId,
  selectIsChatListed,
  selectChatFolder,
} from '../../selectors';
import { ARCHIVED_FOLDER_ID, MAX_ACTIVE_PINNED_CHATS } from '../../../config';

const TYPING_STATUS_CLEAR_DELAY = 6000; // 6 seconds

addReducer('apiUpdate', (global, actions, update: ApiUpdate) => {
  switch (update['@type']) {
    case 'updateChat': {
      if (!selectIsChatListed(global, update.id)) {
        // Chat can appear in dialogs list.
        actions.loadTopChats();
      }

      setGlobal(updateChat(global, update.id, update.chat));

      break;
    }

    case 'updateChatJoin': {
      let newGlobal = global;
      const folder = selectChatFolder(newGlobal, update.id);
      if (!folder) {
        break;
      }

      newGlobal = updateChatListIds(newGlobal, folder, [update.id]);
      newGlobal = updateChat(newGlobal, update.id, { hasLeft: undefined });
      setGlobal(newGlobal);

      const chat = selectChat(newGlobal, update.id);
      if (chat) {
        actions.requestChatUpdate({ chatId: chat.id });
      }
      break;
    }

    case 'updateChatLeave': {
      const folder = selectChatFolder(global, update.id);
      if (!folder) {
        break;
      }
      const { [folder]: listIds } = global.chats.listIds;

      if (listIds) {
        let newGlobal = global;
        newGlobal = replaceChatListIds(newGlobal, folder, listIds.filter((listId) => listId !== update.id));
        newGlobal = updateChat(newGlobal, update.id, { hasLeft: true });
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
      const { ids, folderId } = update;
      const allChats = Object.values(global.chats.byId);

      let newGlobal = global;

      const folder = folderId === ARCHIVED_FOLDER_ID ? 'archived' : 'active';

      newGlobal = {
        ...newGlobal,
        chats: {
          ...newGlobal.chats,
          orderedPinnedIds: {
            ...newGlobal.chats.orderedPinnedIds,
            [folder]: ids.length ? ids : undefined,
          },
        },
      };

      allChats
        .filter((chat) => chat.folderId === folderId)
        .forEach((chat) => {
          if (!chat.isPinned && ids.includes(chat.id)) {
            newGlobal = updateChat(newGlobal, chat.id, { isPinned: true });
          } else if (chat.isPinned && !ids.includes(chat.id)) {
            newGlobal = updateChat(newGlobal, chat.id, { isPinned: false });
          }
        });

      setGlobal(newGlobal);

      break;
    }

    case 'updateChatPinned': {
      const { id, isPinned } = update;
      let newGlobal = global;

      const folder = selectChatFolder(newGlobal, id);
      if (folder) {
        const { [folder]: orderedPinnedIds } = newGlobal.chats.orderedPinnedIds;
        if (orderedPinnedIds) {
          let newOrderedPinnedIds = orderedPinnedIds;
          if (!isPinned) {
            newOrderedPinnedIds = newOrderedPinnedIds.filter((pinnedId) => pinnedId !== id);
          } else if (!newOrderedPinnedIds.includes(id)) {
            // When moving pinned chats to archive, active ordered pinned ids don't get updated
            // (to preserve chat pinned state when it returns from archive)
            // If user already has max pinned chats, we should check for orderedIds
            // that don't point to listed chats
            if (folder === 'active' && newOrderedPinnedIds.length >= MAX_ACTIVE_PINNED_CHATS) {
              const listIds = newGlobal.chats.listIds.active;
              newOrderedPinnedIds = newOrderedPinnedIds.filter((pinnedId) => listIds && listIds.includes(pinnedId));
            }

            newOrderedPinnedIds = [id, ...newOrderedPinnedIds];
          }

          newGlobal = {
            ...newGlobal,
            chats: {
              ...newGlobal.chats,
              orderedPinnedIds: {
                ...newGlobal.chats.orderedPinnedIds,
                [folder]: newOrderedPinnedIds.length ? newOrderedPinnedIds : undefined,
              },
            },
          };
        }
      }

      newGlobal = updateChat(newGlobal, id, { isPinned });

      setGlobal(newGlobal);

      break;
    }

    case 'updateChatFolder': {
      const { id, folderId } = update;

      setGlobal(updateChatFolder(global, id, folderId));

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
