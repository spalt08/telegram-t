import { Api as GramJs } from '../../../lib/gramjs';
import {
  ApiChat,
  ApiAttachment,
  ApiMessage,
  OnApiUpdate,
  ApiMessageSearchType,
  ApiUser,
  ApiSticker,
  ApiVideo,
  ApiNewPoll,
  ApiMessageEntity,
  ApiOnProgress,
} from '../../types';

import { invokeRequest, uploadFile } from './client';
import {
  buildApiMessage,
  buildLocalMessage,
  resolveMessageApiChatId,
  buildWebPage,
  buildForwardedMessage,
} from '../apiBuilders/messages';
import { buildApiUser } from '../apiBuilders/users';
import {
  buildInputEntity,
  buildInputPeer,
  generateRandomBigInt,
  getEntityTypeById,
  buildInputMediaDocument,
  reduceWaveform,
  buildInputPoll,
  buildMtpMessageEntity,
  isMessageWithMedia,
} from '../gramjsBuilders';
import localDb from '../localDb';
import { buildApiChatFromPreview } from '../apiBuilders/chats';
import { fetchFile } from '../../../util/files';

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
    peer: buildInputPeer(chat.id, chat.accessHash),
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
        channel: buildInputEntity(chat.id, chat.accessHash) as GramJs.InputChannel,
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

export async function sendMessage(
  {
    chat,
    currentUserId,
    text,
    entities,
    replyingTo,
    attachment,
    sticker,
    gif,
    poll,
  }: {
    chat: ApiChat;
    currentUserId: number;
    text?: string;
    entities?: ApiMessageEntity[];
    replyingTo?: number;
    attachment?: ApiAttachment;
    sticker?: ApiSticker;
    gif?: ApiVideo;
    poll?: ApiNewPoll;
  },
  onProgress?: ApiOnProgress,
) {
  const localMessage = buildLocalMessage(
    chat.id, currentUserId, text, entities, replyingTo, attachment, sticker, gif, poll,
  );
  onUpdate({
    '@type': 'newMessage',
    id: localMessage.id,
    chatId: chat.id,
    message: localMessage,
  });

  const randomId = generateRandomBigInt();
  localDb.localMessages[randomId.toString()] = localMessage;

  let media: GramJs.TypeInputMedia | undefined;
  if (attachment) {
    media = await uploadMedia(localMessage, attachment, onProgress!);
  } else if (sticker) {
    media = buildInputMediaDocument(sticker);
  } else if (gif) {
    media = buildInputMediaDocument(gif);
  } else if (poll) {
    media = buildInputPoll(poll, randomId);
  }

  const RequestClass = media ? GramJs.messages.SendMedia : GramJs.messages.SendMessage;
  const mtpEntities = entities && entities.map(buildMtpMessageEntity);

  await invokeRequest(new RequestClass({
    clearDraft: true,
    message: text || '',
    entities: mtpEntities,
    peer: buildInputPeer(chat.id, chat.accessHash),
    randomId,
    ...(replyingTo && { replyToMsgId: replyingTo }),
    ...(media && { media }),
  }), true);
}

export async function editMessage({
  chat,
  message,
  text,
  entities,
}: {
  chat: ApiChat;
  message: ApiMessage;
  text: string;
  entities?: ApiMessageEntity[];
}) {
  const messageUpdate: Partial<ApiMessage> = {
    content: {
      ...message.content,
      text: {
        text,
        entities,
      },
    },
  };

  onUpdate({
    '@type': 'updateMessage',
    id: message.id,
    chatId: chat.id,
    message: messageUpdate,
  });

  localDb.localMessages[message.id] = { ...message, ...messageUpdate };

  const mtpEntities = entities && entities.map(buildMtpMessageEntity);

  await invokeRequest(new GramJs.messages.EditMessage({
    message: text || '',
    entities: mtpEntities,
    peer: buildInputPeer(chat.id, chat.accessHash),
    id: message.id,
  }), true);
}

async function uploadMedia(localMessage: ApiMessage, attachment: ApiAttachment, onProgress: ApiOnProgress) {
  const {
    filename, blobUrl, mimeType, quick, voice,
  } = attachment;

  const file = await fetchFile(blobUrl, filename);
  const patchedOnProgress: ApiOnProgress = (progress) => {
    if (onProgress.isCanceled) {
      patchedOnProgress.isCanceled = true;
    } else {
      onProgress(progress, localMessage.id);
    }
  };
  const inputFile = await uploadFile(file, patchedOnProgress);

  const attributes: GramJs.TypeDocumentAttribute[] = [new GramJs.DocumentAttributeFilename({ fileName: filename })];
  if (quick) {
    if (mimeType.startsWith('image/')) {
      return new GramJs.InputMediaUploadedPhoto({ file: inputFile });
    } else {
      const { width, height, duration } = quick;
      if (duration !== undefined) {
        attributes.push(new GramJs.DocumentAttributeVideo({
          duration,
          w: width,
          h: height,
        }));
      }
    }
  }

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
    peer: buildInputPeer(chat.id, chat.accessHash),
    id: messageId,
  }), true);
}

export async function deleteMessages({
  chat, messageIds, shouldDeleteForAll,
}: {
  chat: ApiChat; messageIds: number[]; shouldDeleteForAll?: boolean;
}) {
  const isChannel = getEntityTypeById(chat.id) === 'channel';

  const result = await invokeRequest(
    isChannel
      ? new GramJs.channels.DeleteMessages({
        channel: buildInputEntity(chat.id, chat.accessHash) as GramJs.InputChannel,
        id: messageIds,
      })
      : new GramJs.messages.DeleteMessages({
        id: messageIds,
        ...(shouldDeleteForAll && { revoke: true }),
      }),
  );

  if (!result) {
    return;
  }

  onUpdate({
    '@type': 'deleteMessages',
    ids: messageIds,
    ...(isChannel && { chatId: chat.id }),
  });
}

export async function markMessagesRead({
  chat, messageIds,
}: {
  chat: ApiChat; messageIds: number[];
}) {
  const isChannel = getEntityTypeById(chat.id) === 'channel';

  await invokeRequest(
    isChannel
      ? new GramJs.channels.ReadMessageContents({
        channel: buildInputEntity(chat.id, chat.accessHash) as GramJs.InputChannel,
        id: messageIds,
      })
      : new GramJs.messages.ReadMessageContents({
        id: messageIds,
      }),
    true,
  );

  onUpdate({
    ...(isChannel ? {
      '@type': 'updateChannelMessages',
      channelId: chat.id,
    } : {
      '@type': 'updateCommonBoxMessages',
    }),
    ids: messageIds,
    messageUpdate: {
      hasUnreadMention: false,
      isMediaUnread: false,
    },
  });
}

export async function searchMessages({
  chatOrUser, type, query, ...pagination
}: {
  chatOrUser: ApiChat | ApiUser;
  type?: ApiMessageSearchType;
  query?: string;
  offsetId?: number;
  addOffset?: number;
  limit: number;
}) {
  let filter;
  switch (type) {
    case 'media':
      filter = new GramJs.InputMessagesFilterPhotoVideo();
      break;
    case 'documents':
      filter = new GramJs.InputMessagesFilterDocument();
      break;
    case 'links':
      filter = new GramJs.InputMessagesFilterUrl();
      break;
    case 'audio':
      filter = new GramJs.InputMessagesFilterMusic();
      break;
    case 'text':
    default:
      filter = new GramJs.InputMessagesFilterEmpty();
  }

  const result = await invokeRequest(new GramJs.messages.Search({
    peer: buildInputPeer(chatOrUser.id, chatOrUser.accessHash),
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

export async function searchMessagesGlobal({
  query, offsetRate = 0, limit,
}: {
  query: string;
  offsetRate?: number;
  limit: number;
}) {
  try {
    const result = await invokeRequest(new GramJs.messages.SearchGlobal({
      q: query,
      offsetRate,
      offsetPeer: new GramJs.InputPeerEmpty(),
      limit,
    }));

    if (
      !result
      || result instanceof GramJs.messages.MessagesNotModified
      || !result.messages
    ) {
      return undefined;
    }

    updateLocalDb({
      chats: result.chats,
      users: result.users,
      messages: [] as GramJs.Message[],
    } as GramJs.messages.Messages);

    const messages = result.messages.map(buildApiMessage).filter<ApiMessage>(Boolean as any);
    const users = result.users.map(buildApiUser).filter<ApiUser>(Boolean as any);
    const chats = result.chats.map((user) => buildApiChatFromPreview(user)).filter<ApiChat>(Boolean as any);

    let totalCount = messages.length;
    let nextRate: number | undefined;
    if (result instanceof GramJs.messages.MessagesSlice || result instanceof GramJs.messages.ChannelMessages) {
      totalCount = result.count;

      if (messages.length) {
        nextRate = messages[messages.length - 1].id;
      }
    }

    return {
      messages,
      users,
      chats,
      totalCount,
      nextRate: 'nextRate' in result && result.nextRate ? result.nextRate : nextRate,
    };
  } catch (err) {
    return undefined;
  }
}

export async function fetchWebPagePreview({ message }: { message: string }) {
  const preview = await invokeRequest(new GramJs.messages.GetWebPagePreview({
    message,
  }));

  return preview && buildWebPage(preview);
}

export async function sendPollVote({
  chat, messageId, options,
}: {
  chat: ApiChat;
  messageId: number;
  options: string[];
}) {
  const { id, accessHash } = chat;

  await invokeRequest(new GramJs.messages.SendVote({
    peer: buildInputPeer(id, accessHash),
    msgId: messageId,
    options: options.map((option) => Buffer.from(option)),
  }), true);
}

export async function forwardMessages({
  fromChat,
  toChats,
  messages,
  currentUserId,
}: {
  fromChat: ApiChat;
  toChats: ApiChat[];
  messages: ApiMessage[];
  currentUserId: number;
}) {
  const messageIds = messages.map(({ id }) => id);
  let isAnySucceeded: boolean = false;

  await Promise.all(toChats.map(async (toChat) => {
    const randomIds = messages.map(generateRandomBigInt);

    messages.forEach((message, index) => {
      const localMessage = buildForwardedMessage(toChat.id, currentUserId, message);
      localDb.localMessages[randomIds[index].toString()] = localMessage;

      onUpdate({
        '@type': 'newMessage',
        id: localMessage.id,
        chatId: toChat.id,
        message: localMessage,
      });
    });

    await invokeRequest(new GramJs.messages.ForwardMessages({
      fromPeer: buildInputPeer(fromChat.id, fromChat.accessHash),
      toPeer: buildInputPeer(toChat.id, toChat.accessHash),
      randomId: randomIds,
      id: messageIds,
    }), true);

    if (!isAnySucceeded) {
      isAnySucceeded = true;
    }
  }));

  return isAnySucceeded;
}

function updateLocalDb(
  result: GramJs.messages.MessagesSlice | GramJs.messages.Messages | GramJs.messages.ChannelMessages,
) {
  result.users.forEach((user) => {
    if (user instanceof GramJs.User) {
      localDb.users[user.id] = user;
    }
  });

  result.chats.forEach((chat) => {
    if (chat instanceof GramJs.Chat || chat instanceof GramJs.Channel) {
      localDb.chats[chat.id] = chat;
    }
  });

  result.messages.forEach((message) => {
    if (message instanceof GramJs.Message && isMessageWithMedia(message)) {
      const messageFullId = `${resolveMessageApiChatId(message)}-${message.id}`;
      localDb.messages[messageFullId] = message;
    }
  });
}
