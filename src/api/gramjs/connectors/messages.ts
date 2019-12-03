import { Api as GramJs } from '../../../lib/gramjs';

import { ApiMessage } from '../../types';
import { OnApiUpdate } from '../types';

import { invokeRequest } from '../client';
import { buildApiMessage, buildLocalMessage } from '../builders/messages';
import { buildApiUser } from '../builders/users';
import { buildInputPeer, generateRandomBigInt } from '../inputHelpers';
import localDb from '../localDb';
import { loadMessageMedia } from './files';
import { UNSUPPORTED_RESPONSE } from '../utils';
import { onGramJsUpdate } from '../onGramJsUpdate';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchMessages({ chatId, fromMessageId, limit }: {
  chatId: number;
  fromMessageId: number;
  limit: number;
}): Promise<{ messages: ApiMessage[] } | null> {
  const result = await invokeRequest(new GramJs.messages.GetHistory({
    offsetId: fromMessageId,
    limit,
    peer: buildInputPeer(chatId),
  }));

  if (
    !result
    || result instanceof GramJs.messages.MessagesNotModified
    || !result.messages
  ) {
    return null;
  }

  (result.users as GramJs.User[]).forEach((mtpUser) => {
    const user = buildApiUser(mtpUser);

    onUpdate({
      '@type': 'updateUser',
      id: user.id,
      user,
    });
  });

  const messages = (result.messages as GramJs.Message[])
    .map((mtpMessage) => {
      loadImage(mtpMessage);
      return buildApiMessage(mtpMessage);
    });

  return {
    messages,
  };
}

export async function sendMessage(chatId: number, text: string) {
  const localMessage = buildLocalMessage(chatId, text);
  onUpdate({
    '@type': 'updateMessage',
    id: localMessage.id,
    chat_id: chatId,
    message: localMessage,
  });

  onUpdate({
    '@type': 'updateChat',
    id: chatId,
    chat: {
      last_message: localMessage,
    },
  });

  const randomId = generateRandomBigInt();
  localDb.localMessages[randomId.toString()] = localMessage;
  const request = new GramJs.messages.SendMessage({
    message: text,
    peer: buildInputPeer(chatId),
    randomId,
  });
  const result = await invokeRequest(request);

  if (result instanceof GramJs.UpdatesTooLong) {
    throw new Error(UNSUPPORTED_RESPONSE);
  }

  if (result instanceof GramJs.Updates) {
    result.updates.forEach((update) => onGramJsUpdate(update, request));
  } else {
    onGramJsUpdate(result, request);
  }
}

function loadImage(mtpMessage: GramJs.Message) {
  if (!isMessageWithImage(mtpMessage)) {
    return;
  }

  loadMessageMedia(mtpMessage).then((dataUri) => {
    if (!dataUri) {
      return;
    }

    onUpdate({
      '@type': 'updateMessageImage',
      message_id: mtpMessage.id,
      data_uri: dataUri,
    });
  });
}

function isMessageWithImage(message: GramJs.Message) {
  const { media } = message;

  if (!media) {
    return false;
  }

  if (media instanceof GramJs.MessageMediaPhoto) {
    return true;
  }

  if (media instanceof GramJs.MessageMediaDocument && media.document) {
    return ('attributes' in media.document) && media.document.attributes
      .some((attr: any) => attr instanceof GramJs.DocumentAttributeSticker);
  }

  return false;
}
