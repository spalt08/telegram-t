import { GlobalState } from '../../global/types';

export function selectCurrentMessageSearchChatId(global: GlobalState) {
  const { byChatId } = global.messageSearch;
  const selectedChatId = global.chats.selectedId;
  const selectedUserId = global.users.selectedId;

  // First priority: Selected chat text search
  const chatSearch = selectedChatId && byChatId[selectedChatId];
  if (chatSearch && chatSearch.currentType === 'text') {
    return selectedChatId;
  }

  // Second priority: Selected user media
  const userSearch = selectedUserId && byChatId[selectedUserId];
  if (userSearch && userSearch.currentType !== 'text') {
    return selectedUserId;
  }

  // Third priority: Selected chat media
  return selectedChatId;
}

export function selectCurrentMessageSearch(global: GlobalState) {
  const chatId = selectCurrentMessageSearchChatId(global);
  if (!chatId) {
    return undefined;
  }

  return global.messageSearch.byChatId[chatId];
}
