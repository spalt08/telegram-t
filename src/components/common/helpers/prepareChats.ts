import { ApiChat } from '../../../api/types';
import { orderBy } from '../../../util/iteratees';

export default function prepareChats(chats: Record<number, ApiChat>, listIds: number[], orderedPinnedIds?: number[]) {
  const filtered = Object.values(chats).filter((chat) => Boolean(chat.lastMessage) && listIds.includes(chat.id));
  const pinnedChats = orderedPinnedIds
    ? orderedPinnedIds.map((id) => chats[id])
    : filtered.filter((chat) => chat.isPinned);
  const otherChats = orderBy(filtered.filter((chat) => !chat.isPinned), [(chat) => (
    Math.max(chat.joinDate || 0, chat.lastMessage ? chat.lastMessage.date : 0)
  )], 'desc');

  return {
    pinnedChats,
    otherChats,
  };
}
