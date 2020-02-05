import { GlobalState } from '../../store/types';
import { ApiMessage, ApiMessageOutgoingStatus, ApiUser } from '../../api/types';
import { selectChat, selectIsChatWithSelf } from './chats';
import {
  getMessageKey,
  getSendingState, isChatBasicGroup, isChatChannel, isMessageLocal, isChatPrivate, isChatSuperGroup,
} from '../helpers';
import { selectUser } from './users';

export function selectChatMessages(global: GlobalState, chatId: number) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messages.byId : null;
}

// This method is not optimal (new `[]` is returned) and should be used with memoization.
export function selectChatMessagesByIds(global: GlobalState, chatId: number, messageIds: number[]) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messageIds.map((id) => messages.byId[id]) : [];
}

export function selectChatMessageListedIds(global: GlobalState, chatId: number) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messages.listedIds : undefined;
}

export function selectChatMessage(global: GlobalState, chatId: number, messageId: number) {
  const chatMessages = selectChatMessages(global, chatId);

  return chatMessages ? chatMessages[messageId] : null;
}

export function selectIsUnread(global: GlobalState, message: ApiMessage) {
  const chat = selectChat(global, message.chat_id);

  return isMessageLocal(message) || (chat && chat.last_read_outbox_message_id < message.id);
}

export function selectOutgoingStatus(global: GlobalState, message: ApiMessage): ApiMessageOutgoingStatus {
  if (!selectIsUnread(global, message)) {
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

  return message.forward_info ? selectUser(global, message.forward_info.origin.sender_user_id) : undefined;
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
