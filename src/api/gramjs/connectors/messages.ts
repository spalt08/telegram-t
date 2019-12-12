import { Api as GramJs } from '../../../lib/gramjs';

import { ApiMessage } from '../../types';
import { OnApiUpdate } from '../types';

import { invokeRequest } from '../client';
import { buildApiMessage, buildLocalMessage } from '../builders/messages';
import { buildApiUser } from '../builders/users';
import { buildInputPeer, generateRandomBigInt } from '../inputHelpers';
import localDb from '../localDb';
import { loadAvatar, loadMessageMedia } from './files';
import { UNSUPPORTED_RESPONSE } from '../utils';
import { onGramJsUpdate } from '../onGramJsUpdate';
import { pause } from '../../../util/schedulers';
import { getApiChatIdFromMtpPeer } from '../builders/chats';

// This is an heuristic value that allows subsequent images to load properly when intermediate load breaks.
const IMAGE_LOAD_DELAY = 150;

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

  result.users.forEach((mtpUser) => {
    const user = buildApiUser(mtpUser);

    onUpdate({
      '@type': 'updateUser',
      id: user.id,
      user,
    });

    loadAvatar(mtpUser).then((dataUri) => {
      if (!dataUri) {
        return;
      }

      onUpdate({
        '@type': 'updateAvatar',
        chat_id: getApiChatIdFromMtpPeer({ userId: user.id } as GramJs.TypePeer),
        data_uri: dataUri,
      });
    });
  });

  void loadImages(result.messages);

  const messages = result.messages.map(buildApiMessage);

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

async function loadImages(messages: GramJs.TypeMessage[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const message of messages) {
    if (message instanceof GramJs.Message && isMessageWithImage(message)) {
      await pause(IMAGE_LOAD_DELAY);

      try {
        // eslint-disable-next-line no-loop-func
        loadMessageMedia(message).then((dataUri) => {
          if (!dataUri) {
            return;
          }

          onUpdate({
            '@type': 'updateMessageImage',
            message_id: message.id,
            data_uri: dataUri,
          });
        });
      } catch (err) {
        // Do nothing.
      }
    }
  }
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
