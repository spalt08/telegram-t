import { Api as GramJs } from '../../../lib/gramjs';
import { ApiChat, ApiMessage, OnApiUpdate } from '../../types';

import { invokeRequest } from '../client';
import { buildApiMessage, buildLocalMessage, resolveMessageApiChatId } from '../builders/messages';
import { buildApiUser } from '../builders/users';
import { buildInputPeer, generateRandomBigInt } from '../inputHelpers';
import localDb from '../localDb';
import { onGramJsUpdate } from '../onGramJsUpdate';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchMessages({ chat, fromMessageId, limit }: {
  chat: ApiChat;
  fromMessageId: number;
  limit: number;
}): Promise<{ messages: ApiMessage[] } | null> {
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

  result.users.forEach((mtpUser) => {
    const user = buildApiUser(mtpUser);

    onUpdate({
      '@type': 'updateUser',
      id: user.id,
      user,
    });
  });

  updateLocalDb(result);

  const messages = result.messages.map(buildApiMessage);

  return {
    messages,
  };
}

export async function sendMessage({ chat, text }: { chat: ApiChat; text: string }) {
  const localMessage = buildLocalMessage(chat.id, text);
  onUpdate({
    '@type': 'newMessage',
    id: localMessage.id,
    chat_id: chat.id,
    message: localMessage,
  });

  const randomId = generateRandomBigInt();
  localDb.localMessages[randomId.toString()] = localMessage;
  const request = new GramJs.messages.SendMessage({
    message: text,
    peer: buildInputPeer(chat.id, chat.access_hash),
    randomId,
  });
  const result = await invokeRequest(request);

  // TODO Implement
  if (result instanceof GramJs.UpdatesTooLong) {
    return;
  }

  if (result instanceof GramJs.Updates) {
    result.updates.forEach((update) => onGramJsUpdate(update, request));
  } else {
    onGramJsUpdate(result, request);
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
