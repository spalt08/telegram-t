import { ApiMessage } from '../types/messages';
import { selectChat } from './chats';
import { GlobalState } from '../../../lib/teactn';
import { getSendingState } from '../helpers';

const EMPTY_OBJECT = {};

export function selectChatMessages(global: GlobalState, chatId: number) {
  return (global.messages.byChatId[chatId] || {}).byId || EMPTY_OBJECT;
}

export function selectIsUnread(global: GlobalState, message: ApiMessage) {
  const chat = selectChat(global, message.chat_id);

  return chat.last_read_outbox_message_id < message.id;
}

export function selectOutgoingStatus(global: GlobalState, message: ApiMessage) {
  if (!selectIsUnread(global, message)) {
    return 'read';
  }

  return getSendingState(message);
}
