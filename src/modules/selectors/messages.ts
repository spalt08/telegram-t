import { GlobalState } from '../../global/types';
import { ApiMessage, ApiMessageOutgoingStatus, ApiUser } from '../../api/types';

import { selectChat, selectIsChatWithSelf } from './chats';
import { selectUser } from './users';
import {
  getMessageKey,
  getMessageText,
  getSendingState,
  isChatBasicGroup,
  isChatChannel,
  isMessageLocal,
  isChatPrivate,
  isChatSuperGroup,
  isForwardedMessage,
} from '../helpers';

const MESSAGE_EDIT_ALLOWED_TIME_MS = 172800000; // 48 hours

export function selectChatMessages(global: GlobalState, chatId: number) {
  const messages = global.messages.byChatId[chatId];

  return messages ? messages.byId : undefined;
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

  return last_message && viewportIds ? viewportIds[viewportIds.length - 1] >= last_message.id : false;
}

export function selectChatMessage(global: GlobalState, chatId: number, messageId: number) {
  const chatMessages = selectChatMessages(global, chatId);

  return chatMessages ? chatMessages[messageId] : undefined;
}

export function selectChatMessageByPollId(global: GlobalState, pollId: string) {
  let messageWithPoll: ApiMessage | undefined;

  // eslint-disable-next-line no-restricted-syntax
  for (const chatMessages of Object.values(global.messages.byChatId)) {
    const { byId } = chatMessages;
    messageWithPoll = Object.values(byId).find((message) => {
      return message.content.poll && message.content.poll.id === pollId;
    });
    if (messageWithPoll) {
      break;
    }
  }

  return messageWithPoll;
}

export function selectFocusedMessageId(global: GlobalState, chatId: number) {
  const { messageId, chatId: focusedChatId } = global.focusedMessage || {};

  return focusedChatId === chatId ? messageId : undefined;
}

export function selectIsMessageFocused(global: GlobalState, message: ApiMessage) {
  const { messageId, chatId: focusedChatId } = global.focusedMessage || {};

  return focusedChatId === message.chat_id && (messageId === message.id || messageId === message.prev_local_id);
}

export function selectIsMessageUnread(global: GlobalState, message: ApiMessage) {
  const { last_read_outbox_message_id } = selectChat(global, message.chat_id) || {};
  return isMessageLocal(message) || (last_read_outbox_message_id && last_read_outbox_message_id < message.id);
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
  if (!chat) {
    return {};
  }

  const isPrivate = isChatPrivate(chat.id);
  const isChatWithSelf = isPrivate && selectIsChatWithSelf(global, chat!);
  const isBasicGroup = isChatBasicGroup(chat);
  const isSuperGroup = isChatSuperGroup(chat);
  const isChannel = isChatChannel(chat);

  const isOwnMessage = selectIsOwnMessage(global, message);
  const isAdminOrOwner = !isPrivate && false; // TODO Implement.
  const isSuperGroupOrChannelAdmin = (isSuperGroup || isChannel) && isAdminOrOwner;

  const canReply = !isChannel;
  const canPin = Boolean(isChatWithSelf || isBasicGroup || isSuperGroupOrChannelAdmin);
  const canDelete = isPrivate || isBasicGroup || isSuperGroupOrChannelAdmin || isOwnMessage;
  const canDeleteForAll = canDelete
    ? Boolean((isPrivate && !isChatWithSelf) || isBasicGroup || isSuperGroupOrChannelAdmin)
    : false;

  const canEdit = isOwnMessage
    && Date.now() - message.date * 1000 < MESSAGE_EDIT_ALLOWED_TIME_MS
    && Boolean(getMessageText(message))
    && !isForwardedMessage(message);

  return {
    canReply, canEdit, canPin, canDelete, canDeleteForAll,
  };
}

export function selectUploadProgress(global: GlobalState, message: ApiMessage) {
  const messageKey = getMessageKey(message.chat_id, message.prev_local_id || message.id);
  const fileTransfer = global.fileUploads.byMessageKey[messageKey];

  return fileTransfer ? fileTransfer.progress : undefined;
}

export function selectRealLastReadId(global: GlobalState, chatId: number) {
  const chat = selectChat(global, chatId);
  if (!chat) {
    return undefined;
  }
  const { last_message, last_read_inbox_message_id } = chat;

  // Edge case #1
  if (last_message && (last_read_inbox_message_id === undefined || last_message.id < last_read_inbox_message_id)) {
    return last_message.id;
  }

  if (last_read_inbox_message_id === undefined) {
    return undefined;
  }

  // Edge case #2
  const listedIds = selectListedIds(global, chatId);
  if (listedIds && listedIds.length) {
    const closestId = listedIds.find((id, i) => (
      id === last_read_inbox_message_id
      || (id < last_read_inbox_message_id && listedIds[i + 1] > last_read_inbox_message_id)
    ));

    if (closestId) {
      return closestId;
    }
  }

  return last_read_inbox_message_id;
}

export function selectFirstUnreadId(global: GlobalState, chatId: number) {
  const chat = selectChat(global, chatId);
  if (!chat || !chat.unread_count) {
    return undefined;
  }

  const lastReadId = selectRealLastReadId(global, chatId);
  const listedIds = selectListedIds(global, chatId);
  const byId = selectChatMessages(global, chatId);

  if (!chat.unread_count || lastReadId === undefined || !listedIds || !byId) {
    return undefined;
  }

  return listedIds.find((id) => id > lastReadId && byId[id] && !byId[id].is_outgoing);
}

export function selectIsForwardMenuOpen(global: GlobalState) {
  const { forwardMessages } = global;
  return Boolean(forwardMessages.fromChatId);
}
