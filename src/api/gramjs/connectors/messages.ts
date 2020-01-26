import { Api as GramJs } from '../../../lib/gramjs';
import { ApiChat, OnApiUpdate } from '../../types';

import { invokeRequest } from '../client';
import { buildApiMessage, buildLocalMessage, resolveMessageApiChatId } from '../builders/messages';
import { buildApiUser } from '../builders/users';
import {
  buildInputEntity, buildInputPeer, generateRandomBigInt, getEntityTypeById,
} from '../inputHelpers';
import localDb from '../localDb';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchMessages({ chat, fromMessageId, limit }: {
  chat: ApiChat;
  fromMessageId: number;
  limit: number;
}) {
  const result = await invokeRequest(new GramJs.messages.GetHistory({
    offsetId: fromMessageId,
    limit,
    peer: buildInputPeer(chat.id, chat.access_hash),
  }));

  if (
    !result
    || result instanceof GramJs.messages.MessagesNotModified
    || !result.messages
  ) {
    return null;
  }

  updateLocalDb(result);

  const messages = result.messages.map(buildApiMessage);
  const users = result.users.map(buildApiUser);

  return {
    messages,
    users,
  };
}

export async function sendMessage({
  chat, text, replyingTo,
}: {
  chat: ApiChat; text: string; replyingTo?: number;
}) {
  const localMessage = buildLocalMessage(chat.id, text, replyingTo);
  onUpdate({
    '@type': 'newMessage',
    id: localMessage.id,
    chat_id: chat.id,
    message: localMessage,
  });

  const randomId = generateRandomBigInt();
  localDb.localMessages[randomId.toString()] = localMessage;

  await invokeRequest(new GramJs.messages.SendMessage({
    message: text,
    peer: buildInputPeer(chat.id, chat.access_hash),
    randomId,
    ...(replyingTo && { replyToMsgId: replyingTo }),
  }), true);
}

export async function pinMessage({ chat, messageId }: { chat: ApiChat; messageId: number }) {
  await invokeRequest(new GramJs.messages.UpdatePinnedMessage({
    peer: buildInputPeer(chat.id, chat.access_hash),
    id: messageId,
  }), true);
}

export async function deleteMessages({
  chat, messageIds, shouldDeleteForAll,
}: {
  chat: ApiChat; messageIds: number[]; shouldDeleteForAll?: boolean;
}) {
  const isChannel = getEntityTypeById(chat.id) === 'channel';

  await invokeRequest(
    isChannel
      ? new GramJs.channels.DeleteMessages({
        channel: buildInputEntity(chat.id, chat.access_hash) as GramJs.InputChannel,
        id: messageIds,
      })
      : new GramJs.messages.DeleteMessages({
        id: messageIds,
        ...(shouldDeleteForAll && { revoke: true }),
      }),
  );

  onUpdate({
    '@type': 'deleteMessages',
    ids: messageIds,
    ...(isChannel && { chat_id: chat.id }),
  });
}

export async function markMessagesRead({
  chat, maxId,
}: {
  chat: ApiChat; maxId?: number;
}) {
  const isChannel = getEntityTypeById(chat.id) === 'channel';

  const result = await invokeRequest(
    isChannel
      ? new GramJs.channels.ReadHistory({
        channel: buildInputEntity(chat.id, chat.access_hash) as GramJs.InputChannel,
        maxId,
      })
      : new GramJs.messages.ReadHistory({
        peer: buildInputPeer(chat.id, chat.access_hash),
        maxId,
      }),
  );

  if (result !== false) {
    onUpdate({
      '@type': 'updateChat',
      id: chat.id,
      chat: {
        // TODO Support partial reading.
        unread_count: 0,
        last_read_inbox_message_id: maxId,
      },
    });
  }
}

function updateLocalDb(
  result: GramJs.messages.MessagesSlice | GramJs.messages.Messages | GramJs.messages.ChannelMessages,
) {
  result.users.forEach((user) => {
    localDb.users[user.id] = user;
  });

  result.messages.forEach((message) => {
    if (message instanceof GramJs.Message && isMessageWithMedia(message)) {
      const messageFullId = `${resolveMessageApiChatId(message)}-${message.id}`;
      localDb.messages[messageFullId] = message;
    }
  });
}

function isMessageWithMedia(message: GramJs.Message) {
  const { media } = message;

  if (!media) {
    return false;
  }

  if (media instanceof GramJs.MessageMediaPhoto) {
    return true;
  }

  if (media instanceof GramJs.MessageMediaDocument && media.document) {
    return ('attributes' in media.document) && media.document.attributes
      .some((attr: any) => (
        attr instanceof GramJs.DocumentAttributeSticker
        || attr instanceof GramJs.DocumentAttributeVideo
      ));
  }

  return false;
}
