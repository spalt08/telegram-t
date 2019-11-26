import { GlobalState } from '../../store/types';
import { ApiMessage } from '../../api/types';
import { selectChat } from './chats';
import {
  getMessageFileKey, getSendingState, isMessageLocal,
} from '../helpers';

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

export function selectMessageFileUrl(global: GlobalState, message: ApiMessage) {
  const fileKey = getMessageFileKey(message);

  if (!fileKey) {
    return null;
  }

  const file = global.files.byKey[fileKey];

  if (!file || !file.dataUri) {
    return null;
  }

  return file && file.dataUri ? file.dataUri : null;
}
