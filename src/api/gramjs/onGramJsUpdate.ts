import { Api as GramJs } from '../../lib/gramjs';
import { OnApiUpdate } from '../types';

import { buildApiMessage, buildApiMessageFromShort, buildApiMessageFromShortChat } from './builders/messages';
import { getApiChatIdFromMtpPeer } from './builders/chats';
import { buildApiUserStatus } from './builders/users';
import localDb from './localDb';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export function onGramJsUpdate(update: GramJs.TypeUpdate, originRequest?: GramJs.AnyRequest) {
  if (
    update instanceof GramJs.UpdateNewMessage
    || update instanceof GramJs.UpdateShortChatMessage
    || update instanceof GramJs.UpdateShortMessage
    || update instanceof GramJs.UpdateNewChannelMessage
  ) {
    let message;

    if (update instanceof GramJs.UpdateNewMessage || update instanceof GramJs.UpdateNewChannelMessage) {
      if (update.message instanceof GramJs.Message) {
        localDb.messages[update.message.id] = update.message;
      }

      message = buildApiMessage(update.message);
    } else if (update instanceof GramJs.UpdateShortChatMessage) {
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
    (originRequest instanceof GramJs.messages.SendMessage)
    && (
      update instanceof GramJs.UpdateMessageID
      || update instanceof GramJs.UpdateShortSentMessage
    )
  ) {
    const { randomId } = originRequest;
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
  } else if (update instanceof GramJs.UpdateReadHistoryInbox) {
    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer(update.peer),
      chat: {
        last_read_inbox_message_id: update.maxId,
        unread_count: update.stillUnreadCount,
      },
    });
  } else if (update instanceof GramJs.UpdateReadHistoryOutbox) {
    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer(update.peer),
      chat: {
        last_read_outbox_message_id: update.maxId,
      },
    });
  } else if (update instanceof GramJs.UpdateReadChannelInbox) {
    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer({ channelId: update.channelId } as GramJs.TypePeer),
      chat: {
        last_read_inbox_message_id: update.maxId,
        unread_count: update.stillUnreadCount,
      },
    });
  } else if (update instanceof GramJs.UpdateReadChannelOutbox) {
    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer({ channelId: update.channelId } as GramJs.TypePeer),
      chat: {
        last_read_outbox_message_id: update.maxId,
      },
    });
  } else if (update instanceof GramJs.UpdateUserStatus) {
    onUpdate({
      '@type': 'updateUser',
      id: update.userId,
      user: {
        status: buildApiUserStatus(update.status),
      },
    });
    // TODO @gramjs This one never comes for some reason. `UpdatePinnedDialogs` comes instead.
    // } else if (update instanceof GramJs.UpdateDialogPinned) {
    //   onUpdate({
    //     '@type': 'updateChat',
    //     id: getApiChatIdFromMtpPeer(update.peer),
    //     chat: {
    //       is_pinned: update.pinned || false,
    //     },
    //   });
  }
}
