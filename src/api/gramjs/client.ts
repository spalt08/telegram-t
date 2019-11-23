import {
  InputPeerUser,
  InputPeerChat,
  InputPeerChannel,
  InputPeerPhotoFileLocation,
} from '../../lib/gramjs/tl/types';
import {
  InvokeRequestPayload,
  SupportedMessageRequests,
  SupportedUploadRequests,
} from './types/types';
import {
  ApiFileLocation,
} from '../types';

import { TelegramClient, session } from '../../lib/gramjs';
import * as apiRequests from '../../lib/gramjs/tl/functions';
import { generateRandomBytes, readBigIntFromBuffer } from '../../lib/gramjs/Helpers';

import { DEBUG } from '../../config';
import {
  onAuthReady, onRequestCode, onRequestPassword, onRequestPhoneNumber,
} from './connectors/auth';
import { onGramJsUpdate } from './connectors/updater';

let client: any;

const db: { chats: Record<number, MTP.chat | MTP.channel>; users: Record<number, MTP.user> } = { chats: {}, users: {} };

export async function init(sessionId: string) {
  const { StringSession } = session;

  const stringSession = new StringSession(sessionId);
  client = new TelegramClient(
    stringSession,
    process.env.TELEGRAM_T_API_ID,
    process.env.TELEGRAM_T_API_HASH,
    { useWSS: true } as any,
  );

  client.addEventHandler(onGramJsUpdate, { build: (update: object) => update });

  try {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/worker] CONNECTING');
    }

    await client.start({
      phone: onRequestPhoneNumber,
      code: onRequestCode,
      password: onRequestPassword,
    } as any);

    const newSessionId = stringSession.save();

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/worker] CONNECTED as ', newSessionId);
    }

    onAuthReady(newSessionId);
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/worker] CONNECTING ERROR', err);
    }

    throw err;
  }
}

export async function invokeRequest(data: InvokeRequestPayload) {
  const {
    namespace, name, args, enhancers = {},
  } = data;

  const enhancedArgs = { ...args };

  Object.keys(enhancers).forEach((key) => {
    const [enhancerName, arg] = enhancers[key];
    switch (enhancerName) {
      case 'buildInputPeer':
        Object.assign(enhancedArgs, {
          [key]: buildInputPeer(arg),
        });
        break;
      case 'buildInputPeerPhotoFileLocation':
        Object.assign(enhancedArgs, {
          [key]: buildInputPeerPhotoFileLocation(arg),
        });
        break;
      case 'generateRandomBigInt':
        Object.assign(enhancedArgs, {
          [key]: generateRandomBigInt(),
        });
        break;
    }
  });

  let RequestClass;

  // For some reason these types are not working automatically.
  switch (namespace) {
    case 'messages':
      RequestClass = apiRequests.messages[name as SupportedMessageRequests];
      break;
    case 'upload':
      RequestClass = apiRequests.upload[name as SupportedUploadRequests];
      break;
    default:
      return null;
  }

  const request = new RequestClass(enhancedArgs);

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[GramJs/worker] INVOKE ${name}`, enhancedArgs);
  }

  const result = await client.invoke(request);

  postProcess(name, result);

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[GramJs/worker] INVOKE RESPONSE ${name}`, result);
  }

  return result;
}

function postProcess(name: string, anyResult: any) {
  switch (name) {
    case 'GetDialogsRequest': {
      const result: MTP.messages$Dialogs = anyResult;

      if (!result || !result.dialogs) {
        return;
      }

      result.users.forEach((user) => {
        db.users[user.id] = user as MTP.user;
      });

      result.chats.forEach((chat) => {
        db.chats[chat.id] = chat as MTP.chat | MTP.channel;
      });

      break;
    }

    case 'SendMessageRequest': {
      const result: { updates: MTP.Updates[] } = anyResult;

      if (!result || !result.updates) {
        return;
      }

      result.updates.forEach(onGramJsUpdate);
    }
  }
}

function buildInputPeer(chatOrUserId: number): MTP.Peer {
  if (chatOrUserId > 0) {
    const user = db.users[chatOrUserId] as MTP.user;

    return new InputPeerUser({
      userId: chatOrUserId,
      ...(user && { accessHash: user.accessHash }),
    });
  } else if (chatOrUserId <= -1000000000) {
    const channel = db.chats[-chatOrUserId] as MTP.channel;

    return new InputPeerChannel({
      channelId: -chatOrUserId,
      ...(channel && { accessHash: channel.accessHash }),
    });
  } else {
    return new InputPeerChat({
      chatId: -chatOrUserId,
    });
  }
}

function buildInputPeerPhotoFileLocation(
  { id, fileLocation }: { id: number; fileLocation: ApiFileLocation },
): MTP.inputPeerPhotoFileLocation {
  const peer = buildInputPeer(id);
  const { volumeId, localId } = fileLocation;

  return new InputPeerPhotoFileLocation({
    peer,
    volumeId,
    localId,
  });
}

function generateRandomBigInt() {
  return readBigIntFromBuffer(generateRandomBytes(8), false);
}
