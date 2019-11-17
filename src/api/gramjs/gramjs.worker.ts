import JSBI from 'jsbi';
import {
  InputPeerUser,
  InputPeerChat,
  InputPeerChannel,
  InputPeerPhotoFileLocation,
} from '../../lib/gramjs/tl/types';
import {
  OriginMessageData,
  OriginMessageEvent,
  SupportedMessageRequests,
  SupportedUploadRequests,
  WorkerMessageData,
} from './types/types';
import {
  ApiChat,
  TdLibUpdate,
  TdLibUpdateAuthorizationState,
  UpdateAuthorizationStateType,
} from '../tdlib/types';

import { TelegramClient, session } from '../../lib/gramjs';
import * as apiRequests from '../../lib/gramjs/tl/functions';
import { DEBUG } from '../../config';

let client: any;

const authPromiseResolvers: {
  resolvePhoneNumber: null | Function;
  resolveCode: null | Function;
  resolvePassword: null | Function;
} = {
  resolvePhoneNumber: null,
  resolveCode: null,
  resolvePassword: null,
};

const db: { chats: Record<number, MTP.chat | MTP.channel>; users: Record<number, MTP.user> } = { chats: {}, users: {} };

// @ts-ignore
onmessage = (message: OriginMessageEvent) => {
  const { data } = message;

  if (data.type === 'init') {
    void init(data.sessionId);
  } else if (client) {
    switch (data.type) {
      case 'invokeRequest': {
        void invokeRequest(data);
        break;
      }
      case 'provideAuthPhoneNumber':
        provideAuthPhoneNumber(data.phoneNumber);
        break;
      case 'provideAuthCode':
        provideAuthCode(data.code);
        break;
      case 'provideAuthPassword':
        provideAuthPassword(data.password);
        break;
    }
  }
};

async function invokeRequest(data: OriginMessageData) {
  if (data.type !== 'invokeRequest') {
    return;
  }

  const {
    namespace, name, args, enhancers = {}, messageId,
  } = data;

  const enhancedArgs = { ...args };

  Object.keys(enhancers).forEach((key) => {
    const [enhancerName, arg] = enhancers[key];
    switch (enhancerName) {
      case 'buildInputPeerByApiChatId':
        Object.assign(enhancedArgs, {
          [key]: buildInputPeerByApiChatId(arg),
        });
        break;
      case 'buildInputPeerPhotoFileLocation':
        Object.assign(enhancedArgs, {
          [key]: buildInputPeerPhotoFileLocation(arg),
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
      return;
  }

  const request = new RequestClass(enhancedArgs);

  try {
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

    if (messageId) {
      sendToOrigin({
        messageId,
        type: 'invokeResponse',
        name: data.name,
        result,
      });
    }
  } catch (error) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log(`[GramJs/worker] INVOKE ERROR ${name}`, error);
    }

    if (messageId) {
      sendToOrigin({
        messageId,
        type: 'invokeResponse',
        name: data.name,
        error,
      });
    }
  }
}

function postProcess(name: string, result: MTP.messages$Dialogs) {
  if (name !== 'GetDialogsRequest') {
    return;
  }

  if (!result || !result.dialogs) {
    return;
  }

  result.users.forEach((user) => {
    db.users[user.id] = user as MTP.user;
  });

  result.chats.forEach((chat) => {
    db.chats[chat.id] = chat as MTP.chat | MTP.channel;
  });
}

function onApiUpdate(update: TdLibUpdate) {
  sendToOrigin({
    type: 'apiUpdate',
    update,
  });
}

function onGramJsUpdate(update: object) {
  sendToOrigin({
    type: 'gramJsUpdate',
    // TODO Support minify.
    constructorName: update.constructor.name,
    update,
  });
}

function sendToOrigin(message: WorkerMessageData) {
  // @ts-ignore
  postMessage(message);
}

export async function init(sessionId: string) {
  const { StringSession } = session;

  const stringSession = new StringSession(sessionId);
  client = new TelegramClient(
    stringSession,
    process.env.REACT_APP_TELEGRAM_API_ID,
    process.env.REACT_APP_TELEGRAM_API_HASH,
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
  }
}

function onRequestPhoneNumber() {
  if (!onApiUpdate) {
    return null;
  }

  onApiUpdate(buildAuthState('authorizationStateWaitPhoneNumber'));

  return new Promise((resolve) => {
    authPromiseResolvers.resolvePhoneNumber = resolve;
  });
}

function onRequestCode() {
  if (!onApiUpdate) {
    return null;
  }

  onApiUpdate(buildAuthState('authorizationStateWaitCode'));

  return new Promise((resolve) => {
    authPromiseResolvers.resolveCode = resolve;
  });
}

function onRequestPassword() {
  if (!onApiUpdate) {
    return null;
  }

  onApiUpdate(buildAuthState('authorizationStateWaitPassword'));

  return new Promise((resolve) => {
    authPromiseResolvers.resolvePassword = resolve;
  });
}

function onAuthReady(sessionId: string) {
  if (!onApiUpdate) {
    return;
  }

  onApiUpdate({
    ...buildAuthState('authorizationStateReady'),
    sessionId,
  });
}

function buildAuthState(authState: UpdateAuthorizationStateType): TdLibUpdateAuthorizationState {
  return {
    '@type': 'updateAuthorizationState',
    authorization_state: {
      '@type': authState,
    },
  };
}

function provideAuthPhoneNumber(phoneNumber: string) {
  if (!authPromiseResolvers.resolvePhoneNumber) {
    return;
  }

  authPromiseResolvers.resolvePhoneNumber(phoneNumber);
}

function provideAuthCode(code: string) {
  if (!authPromiseResolvers.resolveCode) {
    return;
  }

  authPromiseResolvers.resolveCode(code);
}

function provideAuthPassword(password: string) {
  if (!authPromiseResolvers.resolvePassword) {
    return;
  }

  authPromiseResolvers.resolvePassword(password);
}

function buildInputPeerByApiChatId(chatId: number): MTP.Peer {
  if (chatId > 0) {
    const user = db.users[chatId] as MTP.user;

    return new InputPeerUser({
      userId: chatId,
      ...(user && { accessHash: user.accessHash }),
    });
  } else if (chatId <= -1000000000) {
    const channel = db.chats[-chatId] as MTP.channel;

    return new InputPeerChannel({
      channelId: -chatId,
      ...(channel && { accessHash: channel.accessHash }),
    });
  } else {
    return new InputPeerChat({
      chatId: -chatId,
    });
  }
}

function buildInputPeerPhotoFileLocation(chat: ApiChat): MTP.inputPeerPhotoFileLocation {
  const fileLocation = chat.photo_locations && chat.photo_locations.small;

  if (!fileLocation) {
    throw new Error('Missing file location');
  }

  const peer = buildInputPeerByApiChatId(chat.id);
  const { volumeId, localId } = fileLocation;

  return new InputPeerPhotoFileLocation({
    peer,
    volumeId: JSBI.BigInt(volumeId),
    localId,
  });
}
