import { GlobalState } from '../../global/types';
import { ApiMessage, ApiMessageOutgoingStatus, ApiUser } from '../../api/types';
import { selectChat, selectIsChatWithSelf } from './chats';
import {
  getMessageKey, getSendingState, isChatBasicGroup, isChatChannel, isMessageLocal, isChatPrivate, isChatSuperGroup,
} from '../helpers';
import { selectUser } from './users';

export function selectChatMessages(global: GlobalState, chatId: number) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messages.byId : null;
}

export function selectListedIds(global: GlobalState, chatId: number) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messages.listedIds : undefined;
}

export function selectOutlyingIds(global: GlobalState, chatId: number) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messages.outlyingIds : undefined;
}

export function selectViewportIds(global: GlobalState, chatId: number) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messages.viewportIds : undefined;
}

export function selectIsViewportNewest(global: GlobalState, chatId: number) {
  const { last_message } = selectChat(global, chatId) || {};
  const viewportIds = selectViewportIds(global, chatId);

  return last_message && viewportIds && viewportIds[viewportIds.length - 1] === last_message.id;
}

export function selectChatMessage(global: GlobalState, chatId: number, messageId: number) {
  const chatMessages = selectChatMessages(global, chatId);

  return chatMessages ? chatMessages[messageId] : null;
}

export function selectFocusedMessageId(global: GlobalState, chatId: number) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messages.focusedMessageId : undefined;
}

export function selectFocusDirection(global: GlobalState, chatId: number) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messages.focusDirection : undefined;
}

export function selectIsMessageUnread(global: GlobalState, message: ApiMessage) {
  const chat = selectChat(global, message.chat_id);

  return isMessageLocal(message) || (chat && chat.last_read_outbox_message_id < message.id);
}

export function selectOutgoingStatus(global: GlobalState, message: ApiMessage): ApiMessageOutgoingStatus {
  if (!selectIsMessageUnread(global, message)) {
    return 'read';
  }

  const sendingState = getSendingState(message);

  if (sendingState === 'succeeded') {
    const chat = selectChat(global, message.chat_id);
    if (chat && selectIsChatWithSelf(global, chat)) {
      return 'read';
    }
  }

  return sendingState;
}

export function selectSender(global: GlobalState, message: ApiMessage): ApiUser | undefined {
  if (message.sender_user_id) {
    return selectUser(global, message.sender_user_id);
  }

  const { forward_info } = message;
  const senderId = forward_info && forward_info.origin.sender_user_id;

  return senderId ? selectUser(global, senderId) : undefined;
}

export function selectIsOwnMessage(global: GlobalState, message: ApiMessage): boolean {
  return message.sender_user_id === global.currentUserId;
}

export function selectAllowedMessagedActions(global: GlobalState, message: ApiMessage) {
  const chat = selectChat(global, message.chat_id);
  const isPrivate = isChatPrivate(chat.id);
  const isChatWithSelf = isPrivate && selectIsChatWithSelf(global, chat);
  const isBasicGroup = isChatBasicGroup(chat);
  const isSuperGroup = isChatSuperGroup(chat);
  const isChannel = isChatChannel(chat);

  const isOwnMessage = selectIsOwnMessage(global, message);
  const isAdminOrOwner = !isPrivate && false; // TODO Implement.
  const isSuperGroupOrChannelAdmin = (isSuperGroup || isChannel) && isAdminOrOwner;

  const canReply = !isChannel;
  const canPin = isChatWithSelf || isBasicGroup || isSuperGroupOrChannelAdmin;
  const canDelete = isPrivate || isBasicGroup || isSuperGroupOrChannelAdmin || isOwnMessage;
  const canDeleteForAll = canDelete && ((isPrivate && !isChatWithSelf) || isBasicGroup || isSuperGroupOrChannelAdmin);

  return {
    canReply, canPin, canDelete, canDeleteForAll,
  };
}

export function selectFileTransferProgress(global: GlobalState, message: ApiMessage) {
  const messageKey = getMessageKey(message.chat_id, message.id);
  const fileTransfer = global.fileTransfers.byMessageKey[messageKey];

  return fileTransfer ? fileTransfer.progress : undefined;
}
