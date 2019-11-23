import * as gramJsApi from '../../../lib/gramjs/tl/types';
import { OnApiUpdate } from '../types/types';

import { buildApiMessage, buildApiMessageFromShortUpdate } from '../builders/messages';
import { getApiChatIdFromMtpPeer } from '../builders/chats';
import { buildApiUserStatus } from '../builders/users';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export function onGramJsUpdate(update: AnyLiteral) {
  if (
    update instanceof gramJsApi.UpdateNewMessage
    || update instanceof gramJsApi.UpdateShortMessage
    || update instanceof gramJsApi.UpdateShortChatMessage
  ) {
    let message;

    if (update instanceof gramJsApi.UpdateNewMessage) {
      message = buildApiMessage(update.message);
    } else {
      const chatId = getApiChatIdFromMtpPeer(update as MTP.Peer);
      message = buildApiMessageFromShortUpdate(chatId, update);
    }

    onUpdate({
      '@type': 'updateNewMessage',
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
  // TODO This one never comes for some reason. `UpdatePinnedDialogs` comes instead.
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
