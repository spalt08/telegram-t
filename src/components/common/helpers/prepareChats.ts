import { ApiChat } from '../../../api/types';
import { orderBy } from '../../../util/iteratees';
import { getChatOrder } from '../../../modules/helpers';

export default function prepareChats(chats: Record<number, ApiChat>, listIds: number[], orderedPinnedIds?: number[]) {
  const chatFilter = (chat?: ApiChat) => {
    if (!chat || !chat.lastMessage) {
      return false;
    }

    return !chat.migratedTo && !chat.isRestricted;
  };

  const listedChats = listIds.map((id) => chats[id]).filter(chatFilter);

  const pinnedChats = orderedPinnedIds
    ? orderedPinnedIds.map((id) => chats[id]).filter(chatFilter)
    : listedChats.filter((chat) => chat.isPinned);
  const otherChats = orderBy(listedChats.filter((chat) => !chat.isPinned), getChatOrder, 'desc');

  return {
    pinnedChats,
    otherChats,
  };
}
