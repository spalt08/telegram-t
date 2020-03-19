import { ApiChat } from '../../../api/types';
import { orderBy } from '../../../util/iteratees';

export default function prepareChats(chats: Record<number, ApiChat>, listIds: number[], orderedPinnedIds?: number[]) {
  const filtered = Object.values(chats).filter((chat) => Boolean(chat.last_message) && listIds.includes(chat.id));
  const pinnedChats = orderedPinnedIds
    ? orderedPinnedIds.map((id) => chats[id])
    : filtered.filter((chat) => chat.is_pinned);
  const otherChats = orderBy(filtered.filter((chat) => !chat.is_pinned), [(chat) => chat.last_message!.date], 'desc');

  return {
    pinnedChats,
    otherChats,
  };
}
