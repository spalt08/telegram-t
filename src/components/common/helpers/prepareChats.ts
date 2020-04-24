import { ApiChat } from '../../../api/types';
import { orderBy } from '../../../util/iteratees';
import { getChatOrder } from '../../../modules/helpers';

export default function prepareChats(chats: Record<number, ApiChat>, listIds: number[], orderedPinnedIds?: number[]) {
  const filtered = Object.values(chats).filter((chat) => Boolean(chat.lastMessage) && listIds.includes(chat.id));
  const pinnedChats = orderedPinnedIds
    ? orderedPinnedIds.map((id) => chats[id])
    : filtered.filter((chat) => chat.isPinned);
  const otherChats = orderBy(filtered.filter((chat) => !chat.isPinned), getChatOrder, 'desc');

  return {
    pinnedChats,
    otherChats,
  };
}
