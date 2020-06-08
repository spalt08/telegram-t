import { ApiChat } from '../../../api/types';
import { orderBy } from '../../../util/iteratees';
import { getChatOrder, isChatArchived } from '../../../modules/helpers';

export default function prepareChats(
  chats: Record<number, ApiChat>,
  listIds: number[],
  orderedPinnedIds?: number[],
  folder: 'all' | 'archived' | 'active' = 'all',
) {
  const chatFilter = (chat?: ApiChat) => {
    if (!chat || !chat.lastMessage) {
      return false;
    }

    switch (folder) {
      case 'active':
        if (isChatArchived(chat)) {
          return false;
        }
        break;
      case 'archived':
        if (!isChatArchived(chat)) {
          return false;
        }
        break;
    }

    return !chat.isRestricted && !chat.hasLeft;
  };

  const listedChats = listIds.map((id) => chats[id]).filter(chatFilter);

  const pinnedChats = orderedPinnedIds
    ? orderedPinnedIds.map((id) => chats[id]).filter(chatFilter)
    : listedChats.filter((chat) => chat.isPinned);
  const otherChats = orderBy(
    listedChats.filter(
      (chat) => (orderedPinnedIds ? !orderedPinnedIds.includes(chat.id) : !chat.isPinned),
    ),
    getChatOrder,
    'desc',
  );

  return {
    pinnedChats,
    otherChats,
  };
}
