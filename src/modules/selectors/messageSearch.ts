import { GlobalState } from '../../global/types';

export function selectCurrentMessageSearchChatId(global: GlobalState) {
  return global.users.selectedId || global.chats.selectedId;
}

export function selectCurrentMessageSearch(global: GlobalState) {
  const chatId = selectCurrentMessageSearchChatId(global);

  if (!chatId) {
    return undefined;
  }

  return global.messageSearch.byChatId[chatId];
}
