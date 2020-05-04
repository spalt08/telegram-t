import { GlobalState } from '../../global/types';
import { ApiMessage, ApiMessageOutgoingStatus, ApiUser } from '../../api/types';

import { selectChat, selectIsChatWithSelf } from './chats';
import { selectUser } from './users';
import {
  getMessageText,
  getSendingState,
  isChatBasicGroup,
  isChatChannel,
  isMessageLocal,
  isChatPrivate,
  isChatSuperGroup,
  isForwardedMessage,
  isCommonBoxChat,
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
  const { lastMessage } = selectChat(global, chatId) || {};
  const viewportIds = selectViewportIds(global, chatId);

  return lastMessage && viewportIds ? viewportIds[viewportIds.length - 1] >= lastMessage.id : false;
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

  return focusedChatId === message.chatId && (messageId === message.id || messageId === message.previousLocalId);
}

export function selectIsMessageUnread(global: GlobalState, message: ApiMessage) {
  const { lastReadOutboxMessageId } = selectChat(global, message.chatId) || {};
  return isMessageLocal(message) || (lastReadOutboxMessageId && lastReadOutboxMessageId < message.id);
}

export function selectOutgoingStatus(global: GlobalState, message: ApiMessage): ApiMessageOutgoingStatus {
  if (!selectIsMessageUnread(global, message)) {
    return 'read';
  }

  const sendingState = getSendingState(message);

  if (sendingState === 'succeeded') {
    const chat = selectChat(global, message.chatId);
    if (chat && selectIsChatWithSelf(global, chat)) {
      return 'read';
    }
  }

  return sendingState;
}

export function selectSender(global: GlobalState, message: ApiMessage): ApiUser | undefined {
  if (message.senderUserId) {
    return selectUser(global, message.senderUserId);
  }

  const { forwardInfo } = message;
  const senderId = forwardInfo && forwardInfo.origin.senderUserId;

  return senderId ? selectUser(global, senderId) : undefined;
}

export function selectIsOwnMessage(global: GlobalState, message: ApiMessage): boolean {
  return message.senderUserId === global.currentUserId;
}

export function selectAllowedMessagedActions(global: GlobalState, message: ApiMessage) {
  const chat = selectChat(global, message.chatId);
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
  const fileTransfer = global.fileUploads.byMessageLocalId[message.previousLocalId || message.id];

  return fileTransfer ? fileTransfer.progress : undefined;
}

export function selectRealLastReadId(global: GlobalState, chatId: number) {
  const chat = selectChat(global, chatId);
  if (!chat) {
    return undefined;
  }
  const { lastMessage, lastReadInboxMessageId } = chat;

  // Edge case #1
  if (lastMessage && (lastReadInboxMessageId === undefined || lastMessage.id < lastReadInboxMessageId)) {
    return lastMessage.id;
  }

  if (lastReadInboxMessageId === undefined) {
    return undefined;
  }

  const byId = selectChatMessages(global, chatId);
  if (byId && byId[lastReadInboxMessageId]) {
    return lastReadInboxMessageId;
  }

  // Edge case #2.1
  const outlyingIds = selectOutlyingIds(global, chatId);
  if (outlyingIds && outlyingIds.length) {
    const closestId = outlyingIds.find((id, i) => (
      id === lastReadInboxMessageId
      || (id < lastReadInboxMessageId && outlyingIds[i + 1] > lastReadInboxMessageId)
    ));

    if (closestId) {
      return closestId;
    }
  }

  // Edge case #2.2
  const listedIds = selectListedIds(global, chatId);
  if (listedIds && listedIds.length) {
    const closestId = listedIds.find((id, i) => (
      id === lastReadInboxMessageId
      || (id < lastReadInboxMessageId && listedIds[i + 1] > lastReadInboxMessageId)
    ));

    if (closestId) {
      return closestId;
    }
  }

  return lastReadInboxMessageId;
}

export function selectFirstUnreadId(global: GlobalState, chatId: number) {
  const chat = selectChat(global, chatId);
  if (!chat || !chat.unreadCount) {
    return undefined;
  }

  const lastReadId = selectRealLastReadId(global, chatId);
  const byId = selectChatMessages(global, chatId);

  if (!chat.unreadCount || lastReadId === undefined || !byId) {
    return undefined;
  }

  const outlyingIds = selectOutlyingIds(global, chatId);
  if (outlyingIds) {
    const found = outlyingIds.find((id) => id > lastReadId && byId[id] && !byId[id].isOutgoing);
    if (found) {
      return found;
    }
  }

  const listedIds = selectListedIds(global, chatId);
  if (listedIds) {
    const found = listedIds.find((id) => id > lastReadId && byId[id] && !byId[id].isOutgoing);
    if (found) {
      return found;
    }
  }

  return undefined;
}

export function selectIsForwardMenuOpen(global: GlobalState) {
  const { forwardMessages } = global;
  return Boolean(forwardMessages.fromChatId);
}

export function selectCommonBoxChatId(global: GlobalState, messageId: number) {
  const fromLastMessage = Object.values(global.chats.byId).find((chat) => (
    isCommonBoxChat(chat) && chat.lastMessage && chat.lastMessage.id === messageId
  ));
  if (fromLastMessage) {
    return fromLastMessage.id;
  }

  const { byChatId } = global.messages;
  return Number(Object.keys(byChatId).find((chatId) => {
    const chat = selectChat(global, Number(chatId));
    return chat && isCommonBoxChat(chat) && byChatId[chat.id].byId[messageId];
  }));
}
