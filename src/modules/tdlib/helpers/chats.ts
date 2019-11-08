import { getGlobal } from '../../../lib/teactn';

export function getChatById(chatId: number) {
  return getGlobal().chats.byId[chatId];
}
