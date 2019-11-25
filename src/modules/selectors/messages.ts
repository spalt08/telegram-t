import { GlobalState } from '../../store/types';
import { ApiMessage } from '../../api/types';
import { selectChat } from './chats';
import {
  getMessageFileId, getSendingState, isMessageLocal,
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
  const fileId = getMessageFileId(message);

  if (!fileId) {
    return null;
  }

  const file = global.files.byId[fileId];

  if (!file || !file.blobUrl) {
    return null;
  }

  return file && file.blobUrl ? file.blobUrl : null;
}
