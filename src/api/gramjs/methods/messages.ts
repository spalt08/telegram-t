import { Api as GramJs } from '../../../lib/gramjs';
import {
  ApiChat, ApiAttachment, ApiMessage, OnApiUpdate,
} from '../../types';

import { invokeRequest, uploadFile } from './client';
import { buildApiMessage, buildLocalMessage, resolveMessageApiChatId } from '../apiBuilders/messages';
import { buildApiUser } from '../apiBuilders/users';
import {
  buildInputEntity, buildInputPeer, generateRandomBigInt, getEntityTypeById,
} from '../gramjsBuilders';
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
  chat, currentUserId, text, replyingTo, attachment,
}: {
  chat: ApiChat;
  currentUserId: number;
  text: string;
  replyingTo?: number;
  attachment?: ApiAttachment;
}) {
  const localMessage = buildLocalMessage(chat.id, currentUserId, text, replyingTo, attachment);
  onUpdate({
    '@type': 'newMessage',
    id: localMessage.id,
    chat_id: chat.id,
    message: localMessage,
  });

  const randomId = generateRandomBigInt();
  localDb.localMessages[randomId.toString()] = localMessage;

  const media = attachment ? await uploadMedia(localMessage, attachment) : undefined;
  const RequestClass = media ? GramJs.messages.SendMedia : GramJs.messages.SendMessage;

  await invokeRequest(new RequestClass({
    message: text,
    peer: buildInputPeer(chat.id, chat.access_hash),
    randomId,
    ...(replyingTo && { replyToMsgId: replyingTo }),
    ...(media && { media }),
  }), true);
}

async function uploadMedia(localMessage: ApiMessage, attachment: ApiAttachment) {
  const inputFile = await uploadFile(attachment.file, (progress) => {
    onUpdate({
      '@type': 'updateFileUploadProgress',
      chat_id: localMessage.chat_id,
      message_id: localMessage.id,
      progress,
    });
  });

  const { file: { type: mimeType, name: fileName }, photo } = attachment;

  return photo
    ? new GramJs.InputMediaUploadedPhoto({ file: inputFile })
    : new GramJs.InputMediaUploadedDocument({
      file: inputFile,
      mimeType,
      attributes: [
        new GramJs.DocumentAttributeFilename({ fileName }),
      ],
    });
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

  await invokeRequest(
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
