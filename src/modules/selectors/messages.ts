import { GlobalState } from '../../store/types';
import { ApiMessage, ApiUser } from '../../api/types';
import { selectChat } from './chats';
import { getSendingState, isMessageLocal } from '../helpers';
import { selectUser } from './users';

export function selectChatMessages(global: GlobalState, chatId: number) {
  const byChatId = global.messages.byChatId[chatId];

  return byChatId ? byChatId.byId : null;
}

export function selectChatMessage(global: GlobalState, chatId: number, messageId: number) {
  const chatMessages = selectChatMessages(global, chatId);

  return chatMessages ? chatMessages[messageId] : null;
}

export function selectIsUnread(global: GlobalState, message: ApiMessage) {
  const chat = selectChat(global, message.chat_id);

  return isMessageLocal(message) || chat.last_read_outbox_message_id < message.id;
}

export function selectOutgoingStatus(global: GlobalState, message: ApiMessage) {
  if (!selectIsUnread(global, message)) {
    return 'read';
  }

  return getSendingState(message);
}

export function selectSender(global: GlobalState, message: ApiMessage): ApiUser | undefined {
  if (message.sender_user_id) {
    return selectUser(global, message.sender_user_id);
  }

  return message.forward_info ? selectUser(global, message.forward_info.origin.sender_user_id) : undefined;
}
