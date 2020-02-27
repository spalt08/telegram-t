import { Api as GramJs } from '../../../lib/gramjs';
import {
  ApiChat,
  ApiAttachment,
  ApiMessage,
  OnApiUpdate,
  ApiMessageSearchMediaType,
  ApiUser,
  ApiSticker,
  ApiVideo,
} from '../../types';

import { invokeRequest, uploadFile } from './client';
import {
  buildApiMessage,
  buildLocalMessage,
  resolveMessageApiChatId,
  buildWebPage,
} from '../apiBuilders/messages';
import { buildApiUser } from '../apiBuilders/users';
import {
  buildInputEntity,
  buildInputPeer,
  generateRandomBigInt,
  getEntityTypeById,
  buildInputMediaDocument,
  reduceWaveform,
} from '../gramjsBuilders';
import localDb from '../localDb';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchMessages({
  chat,
  ...pagination
}: {
  chat: ApiChat;
  offsetId?: number;
  addOffset?: number;
  limit: number;
}) {
  const result = await invokeRequest(new GramJs.messages.GetHistory({
    peer: buildInputPeer(chat.id, chat.access_hash),
    ...pagination,
  }));

  if (
    !result
    || result instanceof GramJs.messages.MessagesNotModified
    || !result.messages
  ) {
    return undefined;
  }

  updateLocalDb(result);

  const messages = result.messages.map(buildApiMessage).filter<ApiMessage>(Boolean as any);
  const users = result.users.map(buildApiUser).filter<ApiUser>(Boolean as any);

  return {
    messages,
    users,
  };
}

export async function fetchMessage({ chat, messageId }: { chat: ApiChat; messageId: number }) {
  const isChannel = getEntityTypeById(chat.id) === 'channel';

  const result = await invokeRequest(
    isChannel
      ? new GramJs.channels.GetMessages({
        channel: buildInputEntity(chat.id, chat.access_hash) as GramJs.InputChannel,
        id: [new GramJs.InputMessageID({ id: messageId })],
      })
      : new GramJs.messages.GetMessages({
        id: [new GramJs.InputMessageID({ id: messageId })],
      }),
  );

  if (!result || result instanceof GramJs.messages.MessagesNotModified) {
    return undefined;
  }

  const mtpMessage = result.messages[0];
  if (!mtpMessage) {
    return undefined;
  }

  const message = mtpMessage && buildApiMessage(mtpMessage);
  if (!message) {
    return undefined;
  }

  if (mtpMessage instanceof GramJs.Message) {
    const messageFullId = `${resolveMessageApiChatId(mtpMessage)}-${mtpMessage.id}`;
    localDb.messages[messageFullId] = mtpMessage;
  }

  const users = result.users.map(buildApiUser).filter<ApiUser>(Boolean as any);

  return { message, users };
}

export async function sendMessage({
  chat,
  currentUserId,
  text,
  replyingTo,
  attachment,
  sticker,
  gif,
}: {
  chat: ApiChat;
  currentUserId: number;
  text?: string;
  replyingTo?: number;
  attachment?: ApiAttachment;
  sticker?: ApiSticker;
  gif?: ApiVideo;
}) {
  const localMessage = buildLocalMessage(chat.id, currentUserId, text, replyingTo, attachment, sticker, gif);
  onUpdate({
    '@type': 'newMessage',
    id: localMessage.id,
    chat_id: chat.id,
    message: localMessage,
  });

  const randomId = generateRandomBigInt();
  localDb.localMessages[randomId.toString()] = localMessage;

  let media: GramJs.TypeInputMedia | undefined;
  if (attachment) {
    media = await uploadMedia(localMessage, attachment);
  } else if (sticker) {
    media = buildInputMediaDocument(sticker);
  } else if (gif) {
    media = buildInputMediaDocument(gif);
  }

  const RequestClass = media ? GramJs.messages.SendMedia : GramJs.messages.SendMessage;

  await invokeRequest(new RequestClass({
    message: text || '',
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

  const { file: { type: mimeType, name: fileName }, quick, voice } = attachment;

  if (quick && mimeType.startsWith('image/')) {
    return new GramJs.InputMediaUploadedPhoto({ file: inputFile });
  }

  const attributes: GramJs.TypeDocumentAttribute[] = [new GramJs.DocumentAttributeFilename({ fileName })];
  if (voice) {
    const { duration, waveform } = voice;
    attributes.push(new GramJs.DocumentAttributeAudio({
      voice: true,
      duration,
      waveform: Buffer.from(reduceWaveform(waveform)),
    }));
  }

  return new GramJs.InputMediaUploadedDocument({
    file: inputFile,
    mimeType,
    attributes,
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

export async function readMessageContents({ messageId }: { messageId: number }) {
  await invokeRequest(new GramJs.messages.ReadMessageContents({
    id: [messageId],
  }), true);

  onUpdate({
    '@type': 'updateMessages',
    ids: [messageId],
    messageUpdate: {
      isMediaUnread: false,
    },
  });
}

export async function searchMessages({
  chatOrUser, query, mediaType, ...pagination
}: {
  chatOrUser: ApiChat | ApiUser;
  query?: string;
  mediaType?: ApiMessageSearchMediaType;
  offsetId?: number;
  addOffset?: number;
  limit: number;
}) {
  let filter = new GramJs.InputMessagesFilterEmpty();
  switch (mediaType) {
    case 'media':
      filter = new GramJs.InputMessagesFilterPhotoVideo();
      break;
    case 'document':
      filter = new GramJs.InputMessagesFilterDocument();
      break;
    case 'webPage':
      filter = new GramJs.InputMessagesFilterUrl();
      break;
    case 'audio':
      filter = new GramJs.InputMessagesFilterMusic();
      break;
  }

  const result = await invokeRequest(new GramJs.messages.Search({
    peer: buildInputPeer(chatOrUser.id, chatOrUser.access_hash),
    filter,
    q: query || '',
    ...pagination,
  }));

  if (
    !result
    || result instanceof GramJs.messages.MessagesNotModified
    || !result.messages
  ) {
    return undefined;
  }

  updateLocalDb(result);

  const messages = result.messages.map(buildApiMessage).filter<ApiMessage>(Boolean as any);
  const users = result.users.map(buildApiUser).filter<ApiUser>(Boolean as any);

  let totalCount = messages.length;
  let nextOffsetId: number | undefined;
  if (result instanceof GramJs.messages.MessagesSlice || result instanceof GramJs.messages.ChannelMessages) {
    totalCount = result.count;

    if (messages.length) {
      nextOffsetId = messages[messages.length - 1].id;
    }
  }

  return {
    messages,
    users,
    totalCount,
    nextOffsetId,
  };
}

export async function fetchWebPagePreview({ message }: { message: string }) {
  const preview = await invokeRequest(new GramJs.messages.GetWebPagePreview({
    message,
  }));

  return preview && buildWebPage(preview);
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
        || attr instanceof GramJs.DocumentAttributeAudio
      ));
  }

  if (
    media instanceof GramJs.MessageMediaWebPage
    && media.webpage instanceof GramJs.WebPage
    && media.webpage.photo instanceof GramJs.Photo
  ) {
    return true;
  }

  return false;
}
