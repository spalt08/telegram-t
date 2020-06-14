import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate } from '../../../api/types';

import {
  updateChat,
  replaceChatListIds,
  updateChatListIds,
  updateChatListType,
} from '../../reducers';
import {
  selectChat,
  selectCommonBoxChatId,
  selectIsChatListed,
  selectChatListType,
} from '../../selectors';
import { ARCHIVED_FOLDER_ID, MAX_ACTIVE_PINNED_CHATS } from '../../../config';
import { pick } from '../../../util/iteratees';

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
      const listType = selectChatListType(newGlobal, update.id);
      if (!listType) {
        break;
      }

      newGlobal = updateChatListIds(newGlobal, listType, [update.id]);
      newGlobal = updateChat(newGlobal, update.id, { hasLeft: undefined });
      setGlobal(newGlobal);

      const chat = selectChat(newGlobal, update.id);
      if (chat) {
        actions.requestChatUpdate({ chatId: chat.id });
      }
      break;
    }

    case 'updateChatLeave': {
      const listType = selectChatListType(global, update.id);
      if (!listType) {
        break;
      }
      const { [listType]: listIds } = global.chats.listIds;

      if (listIds) {
        let newGlobal = global;
        newGlobal = replaceChatListIds(newGlobal, listType, listIds.filter((listId) => listId !== update.id));
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

      let newGlobal = global;

      const listType = folderId === ARCHIVED_FOLDER_ID ? 'archived' : 'active';

      newGlobal = {
        ...newGlobal,
        chats: {
          ...newGlobal.chats,
          orderedPinnedIds: {
            ...newGlobal.chats.orderedPinnedIds,
            [listType]: ids.length ? ids : undefined,
          },
        },
      };

      setGlobal(newGlobal);

      break;
    }

    case 'updateChatPinned': {
      const { id, isPinned } = update;
      let newGlobal = global;

      const listType = selectChatListType(newGlobal, id);
      if (listType) {
        const { [listType]: orderedPinnedIds } = newGlobal.chats.orderedPinnedIds;
        if (orderedPinnedIds) {
          let newOrderedPinnedIds = orderedPinnedIds;
          if (!isPinned) {
            newOrderedPinnedIds = newOrderedPinnedIds.filter((pinnedId) => pinnedId !== id);
          } else if (!newOrderedPinnedIds.includes(id)) {
            // When moving pinned chats to archive, active ordered pinned ids don't get updated
            // (to preserve chat pinned state when it returns from archive)
            // If user already has max pinned chats, we should check for orderedIds
            // that don't point to listed chats
            if (listType === 'active' && newOrderedPinnedIds.length >= MAX_ACTIVE_PINNED_CHATS) {
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
                [listType]: newOrderedPinnedIds.length ? newOrderedPinnedIds : undefined,
              },
            },
          };
        }
      }

      setGlobal(newGlobal);

      break;
    }

    case 'updateChatListType': {
      const { id, folderId } = update;

      setGlobal(updateChatListType(global, id, folderId));

      break;
    }

    case 'updateChatFolder': {
      const { id, folder } = update;
      const { byId: chatFoldersById, orderedIds } = global.chatFolders;

      const newChatFoldersById = folder
        ? { ...chatFoldersById, [id]: folder }
        : pick(
          chatFoldersById,
          Object.keys(chatFoldersById).map(Number).filter((folderId) => folderId !== id),
        );

      const newOrderedIds = folder
        ? orderedIds && orderedIds.includes(id) ? orderedIds : [...(orderedIds || []), id]
        : orderedIds ? orderedIds.filter((orderedId) => orderedId !== id) : undefined;

      setGlobal({
        ...global,
        chatFolders: {
          byId: newChatFoldersById,
          orderedIds: newOrderedIds,
        },
      });

      break;
    }

    case 'updateChatFoldersOrder': {
      const { orderedIds } = update;

      setGlobal({
        ...global,
        chatFolders: {
          ...global.chatFolders,
          orderedIds,
        },
      });

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
