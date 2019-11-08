import { GlobalState } from '../../../lib/teactn';

export function selectChat(global: GlobalState, chatId: number) {
  return global.chats.byId[chatId];
}
