import { Api as GramJs, connection } from '../../lib/gramjs';
import { ApiMessage, OnApiUpdate } from '../types';

import {
  buildApiMessage,
  buildApiMessageFromShort,
  buildApiMessageFromShortChat, buildMessageMediaContent, buildMessageTextContent,
  resolveMessageApiChatId,
  buildPoll,
  buildPollResults,
} from './apiBuilders/messages';
import { getApiChatIdFromMtpPeer, buildChatMembers, buildChatTypingStatus } from './apiBuilders/chats';
import { buildApiUser, buildApiUserStatus } from './apiBuilders/users';
import { buildMessageFromUpdateShortSent } from './gramjsBuilders';
import localDb from './localDb';

type Update = (
  (GramJs.TypeUpdate | GramJs.TypeUpdates) & { _entities?: (GramJs.TypeUser | GramJs.TypeChat)[] }
) | typeof connection.UpdateConnectionState;

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export function updater(update: Update, originRequest?: GramJs.AnyRequest) {
  if (update instanceof connection.UpdateConnectionState) {
    const connectionState = update.state === connection.UpdateConnectionState.states.disconnected
      ? 'connectionStateConnecting'
      : 'connectionStateReady';

    onUpdate({
      '@type': 'updateConnectionState',
      connection_state: {
        '@type': connectionState,
      },
    });

    // Messages
  } else if (
    update instanceof GramJs.UpdateNewMessage
    || update instanceof GramJs.UpdateNewChannelMessage
    || update instanceof GramJs.UpdateShortChatMessage
    || update instanceof GramJs.UpdateShortMessage
  ) {
    let message;

    if (update instanceof GramJs.UpdateShortChatMessage) {
      message = buildApiMessageFromShortChat(update);
    } else if (update instanceof GramJs.UpdateShortMessage) {
      message = buildApiMessageFromShort(update);
    } else {
      if (update.message instanceof GramJs.Message) {
        const messageFullId = `${resolveMessageApiChatId(update.message)}-${update.message.id}`;
        localDb.messages[messageFullId] = update.message;
      }

      message = buildApiMessage(update.message)!;
    }

    // eslint-disable-next-line no-underscore-dangle
    const entities = update._entities;
    if (entities && entities.length) {
      entities
        .map(buildApiUser)
        .forEach((user) => {
          if (!user) {
            return;
          }

          onUpdate({
            '@type': 'updateUser',
            id: user.id,
            user,
          });
        });
    }

    onUpdate({
      '@type': 'newMessage',
      id: message.id,
      chat_id: message.chat_id,
      message,
    });
  } else if (
    update instanceof GramJs.UpdateEditMessage
    || update instanceof GramJs.UpdateEditChannelMessage
  ) {
    if (update.message instanceof GramJs.Message) {
      const messageFullId = `${resolveMessageApiChatId(update.message)}-${update.message.id}`;
      localDb.messages[messageFullId] = update.message;
    }

    const message = buildApiMessage(update.message)!;

    onUpdate({
      '@type': 'editMessage',
      id: message.id,
      chat_id: message.chat_id,
      message,
    });
  } else if (
    update instanceof GramJs.UpdateDeleteMessages
    || update instanceof GramJs.UpdateDeleteChannelMessages
  ) {
    onUpdate({
      '@type': 'deleteMessages',
      ids: update.messages,
      ...((update instanceof GramJs.UpdateDeleteChannelMessages) && {
        chat_id: getApiChatIdFromMtpPeer({ channelId: update.channelId } as GramJs.PeerChannel),
      }),
    });
  } else if ((
    originRequest instanceof GramJs.messages.SendMessage
    || originRequest instanceof GramJs.messages.SendMedia
    || originRequest instanceof GramJs.messages.ForwardMessages
  ) && (
    update instanceof GramJs.UpdateMessageID
    || update instanceof GramJs.UpdateShortSentMessage
  )) {
    const { randomId } = originRequest;
    const localMessage = localDb.localMessages[randomId.toString()];
    if (!localMessage) {
      throw new Error('Local message not found');
    }

    let newContent: ApiMessage['content'] | undefined;
    if (update instanceof GramJs.UpdateShortSentMessage) {
      if (localMessage.content.text && update.entities) {
        newContent = {
          ...buildMessageTextContent(localMessage.content.text.text, update.entities),
        };
      }
      if (update.media) {
        newContent = {
          ...newContent,
          ...buildMessageMediaContent(update.media),
        };
      }

      const mtpMessage = buildMessageFromUpdateShortSent(update.id, localMessage.chat_id, update);
      const messageFullId = `${localMessage.chat_id}-${update.id}`;
      localDb.messages[messageFullId] = mtpMessage;
    }

    onUpdate({
      '@type': 'updateMessageSendSucceeded',
      chat_id: localMessage.chat_id,
      local_id: localMessage.id,
      message: {
        ...localMessage,
        ...(newContent && {
          content: {
            ...localMessage.content,
            ...newContent,
          },
        }),
        id: update.id,
        sending_state: undefined,
      },
    });
  } else if (update instanceof GramJs.UpdateReadMessagesContents) {
    onUpdate({
      '@type': 'updateCommonBoxMessages',
      ids: update.messages,
      messageUpdate: {
        isMediaUnread: false,
      },
    });
  } else if (update instanceof GramJs.UpdateMessagePoll) {
    const { pollId, poll, results } = update;
    if (poll) {
      const apiPoll = buildPoll(poll, results);

      onUpdate({
        '@type': 'updateMessagePoll',
        pollId: pollId.toString(),
        pollUpdate: apiPoll,
      });
    } else {
      const pollResults = buildPollResults(results);
      onUpdate({
        '@type': 'updateMessagePoll',
        pollId: pollId.toString(),
        pollUpdate: { results: pollResults },
      });
    }
  } else if (update instanceof GramJs.UpdateMessagePollVote) {
    onUpdate({
      '@type': 'updateMessagePollVote',
      pollId: update.pollId.toString(),
      userId: update.userId,
      options: update.options.map((option) => String.fromCharCode(...option)),
    });

    // Chats
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
  } else if (
    update instanceof GramJs.UpdateDialogPinned
    && update.peer instanceof GramJs.DialogPeer
  ) {
    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer(update.peer.peer),
      chat: {
        is_pinned: update.pinned || false,
      },
    });
  } else if (update instanceof GramJs.UpdatePinnedDialogs) {
    const ids = update.order
      ? update.order
        .filter((dp): dp is GramJs.DialogPeer => dp instanceof GramJs.DialogPeer)
        .map((dp) => getApiChatIdFromMtpPeer(dp.peer))
      : [];

    onUpdate({
      '@type': 'updatePinnedChatIds',
      ids,
    });
  } else if (update instanceof GramJs.UpdateChatParticipants) {
    const members = buildChatMembers(update.participants);

    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer({ chatId: update.participants.chatId } as GramJs.TypePeer),
      chat: { members_count: members && members.length },
    });

    onUpdate({
      '@type': 'updateChatFullInfo',
      id: getApiChatIdFromMtpPeer({ chatId: update.participants.chatId } as GramJs.TypePeer),
      full_info: { members },
    });
  } else if (
    update instanceof GramJs.UpdateChatPinnedMessage
  ) {
    onUpdate({
      '@type': 'updateChatFullInfo',
      id: getApiChatIdFromMtpPeer({ chatId: update.chatId } as GramJs.TypePeer),
      full_info: {
        pinned_message_id: update.id,
      },
    });
  } else if (
    update instanceof GramJs.UpdateNotifySettings
    && update.peer instanceof GramJs.NotifyPeer
  ) {
    const { silent, muteUntil } = update.notifySettings;

    onUpdate({
      '@type': 'updateChat',
      id: getApiChatIdFromMtpPeer(update.peer.peer),
      chat: {
        is_muted: silent || (typeof muteUntil === 'number' && Date.now() < muteUntil * 1000),
      },
    });
  } else if (
    update instanceof GramJs.UpdateUserTyping
    || update instanceof GramJs.UpdateChatUserTyping
  ) {
    const id = update instanceof GramJs.UpdateUserTyping
      ? update.userId
      : getApiChatIdFromMtpPeer({ chatId: update.chatId } as GramJs.PeerChat);

    onUpdate({
      '@type': 'updateChatTypingStatus',
      id,
      typingStatus: buildChatTypingStatus(update),
    });


    // Users
  } else if (update instanceof GramJs.UpdateUserStatus) {
    onUpdate({
      '@type': 'updateUser',
      id: update.userId,
      user: {
        status: buildApiUserStatus(update.status),
      },
    });
  } else if (update instanceof GramJs.UpdateUserPinnedMessage) {
    onUpdate({
      '@type': 'updateUserFullInfo',
      id: update.userId,
      full_info: {
        pinned_message_id: update.id,
      },
    });
  }
}
