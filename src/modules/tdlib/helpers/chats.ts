import { getGlobal } from '../../../lib/teactn';

export function getChatById(chatId: number) {
  return getGlobal().chats.byId[chatId];
}

export function isPrivate(chatId: number) {
  return chatId > 0;
}
