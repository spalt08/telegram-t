import * as gramJsApi from '../../lib/gramjs/tl/types/index';
import { OnApiUpdate } from './types/types';

import { buildApiMessage, buildApiMessageFromShort, buildApiMessageFromShortChat } from './builders/messages';
import { getApiChatIdFromMtpPeer } from './builders/chats';
import { buildApiUserStatus } from './builders/users';
import localDb from './localDb';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export function onGramJsUpdate(update: AnyLiteral, originRequest?: { name: string; args: AnyLiteral }) {
  if (
    update instanceof gramJsApi.UpdateNewMessage
    || update instanceof gramJsApi.UpdateShortChatMessage
    || update instanceof gramJsApi.UpdateShortMessage
  // TODO UpdateNewChannelMessage
  ) {
    let message;

    if (update instanceof gramJsApi.UpdateNewMessage) {
      message = buildApiMessage(update.message);
    } else if (update instanceof gramJsApi.UpdateShortChatMessage) {
      message = buildApiMessageFromShortChat(update);
    } else {
      message = buildApiMessageFromShort(update);
    }

    onUpdate({
      '@type': 'updateMessage',
      id: message.id,
      chat_id: message.chat_id,
      message,
    });

    onUpdate({
      '@type': 'updateChat',
      id: message.chat_id,
      chat: {
        last_message: message,
      },
    });
  } else if (
    update instanceof gramJsApi.UpdateMessageID
    || update instanceof gramJsApi.UpdateShortSentMessage
  ) {
    const randomId = originRequest && originRequest.args.randomId;
    const localMessage = localDb.localMessages[randomId.toString()];
    if (!localMessage) {
      throw new Error('Local message not found');
    }

    onUpdate({
      '@type': 'updateMessageSendSucceeded',
      chat_id: localMessage.chat_id,
      old_message_id: localMessage.id,
      message: {
        ...localMessage,
        id: update.id,
        sending_state: undefined,
      },
    });
  } else if (update instanceof gramJsApi.UpdateReadHistoryInbox) {
    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer(update.peer),
      chat: {
        last_read_inbox_message_id: update.maxId,
        unread_count: update.stillUnreadCount,
      },
    });
  } else if (update instanceof gramJsApi.UpdateReadHistoryOutbox) {
    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer(update.peer),
      chat: {
        last_read_outbox_message_id: update.maxId,
      },
    });
  } else if (update instanceof gramJsApi.UpdateReadChannelInbox) {
    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer({ channelId: update.channelId }),
      chat: {
        last_read_inbox_message_id: update.maxId,
        unread_count: update.stillUnreadCount,
      },
    });
  } else if (update instanceof gramJsApi.UpdateReadChannelOutbox) {
    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer({ channelId: update.channelId }),
      chat: {
        last_read_outbox_message_id: update.maxId,
      },
    });
  } else if (update instanceof gramJsApi.UpdateUserStatus) {
    onUpdate({
      '@type': 'updateUser',
      id: update.userId,
      user: {
        status: buildApiUserStatus(update.status),
      },
    });
    // TODO @gramjs This one never comes for some reason. `UpdatePinnedDialogs` comes instead.
    // } else if (update instanceof gramJsApi.UpdateDialogPinned) {
    //   onUpdate({
    //     '@type': 'updateChat',
    //     id: getApiChatIdFromMtpPeer(update.peer),
    //     chat: {
    //       is_pinned: update.pinned || false,
    //     },
    //   });
  }
}
