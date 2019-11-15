import { PeerUser, PeerChat, PeerChannel } from '../../lib/gramjs/tl/types';
import { OriginMessageEvent, WorkerMessageData } from './types/types';
import { TdLibUpdate, TdLibUpdateAuthorizationState, UpdateAuthorizationStateType } from '../tdlib/types';

import { TelegramClient, session } from '../../lib/gramjs';
import * as apiRequests from '../../lib/gramjs/tl/functions/messages';
import { DEBUG } from '../../config';

// TODO Persist session.
// eslint-disable-next-line max-len
const SESSION_NAME = '1BJWapzMBu0q/yYxDzGuy8O/vg3kG0FTOVruUQYob5PfbVVk+/5anYS/an286a4p1iAocF4Bp61LD0c4ELbv3ZX5iHl1e11r1MYfFkLZsXMDH7L+GNjf4uFwcT+l4cNHoEU2u/TD7NWW6eRO56H0lwoP5mg78xYXG6gtmlc8sd+UhHSct2tAqS0NtTVeWWHARa0EvWQqmuEIE7Xqr94bITZdNwwDmL0bAE0aDufydP8YI/XHivyZWZ25WIjdIle/n/kxc1DyOT64PT/YbRZAckMkdvzFTU3nqrnPVk//x5qopiPNAiBm1RdywZHc/BjjUuyr64sMwdK02n9ZoQt+x/djADm+LW9U=';

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

// @ts-ignore
onmessage = (async (message: OriginMessageEvent) => {
  const { data } = message;

  if (data.type === 'init') {
    init();
  } else if (client) {
    switch (data.type) {
      case 'invokeRequest': {
        const {
          name, args, enhancers = {}, messageId,
        } = data;

        const enhancedArgs = { ...args };

        Object.keys(enhancers).forEach((key) => {
          const [enhancerName, argument] = enhancers[key];
          switch (enhancerName) {
            case 'buildPeerByApiChatId':
              Object.assign(enhancedArgs, {
                [key]: buildPeerByApiChatId(argument),
              });
              break;
          }
        });

        const RequestClass = apiRequests[name];
        const request = new RequestClass(enhancedArgs);

        try {
          if (DEBUG) {
            // eslint-disable-next-line no-console
            console.log(`[GramJs/worker] INVOKE ${name}`, enhancedArgs);
          }
          const result = await client.invoke(request);
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
        } catch (err) {
          if (DEBUG) {
            // eslint-disable-next-line no-console
            console.log(`[GramJs/worker] INVOKE ERROR ${name}`, err);
          }
        }

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
}) as Worker['onmessage'];

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

export async function init() {
  const { StringSession } = session;

  const stringSession = new StringSession(SESSION_NAME);
  client = new TelegramClient(
    stringSession,
    process.env.REACT_APP_TELEGRAM_API_ID,
    process.env.REACT_APP_TELEGRAM_API_HASH,
  );

  client.addEventHandler(onGramJsUpdate, { build: (update: object) => update });

  try {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/worker] CONNECTING', stringSession.save());
    }

    await client.start({
      phone: onRequestPhoneNumber,
      code: onRequestCode,
      password: onRequestPassword,
    } as any);

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/worker] CONNECTED as ', stringSession.save());
    }

    onAuthReady();
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

function onAuthReady() {
  if (!onApiUpdate) {
    return;
  }

  onApiUpdate(buildAuthState('authorizationStateReady'));
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

export function buildPeerByApiChatId(chatId: number): MTP.Peer {
  if (chatId > 0) {
    return new PeerUser({
      userId: chatId,
    });
  } else if (chatId <= -1000000000) {
    return new PeerChannel({
      channelId: -chatId,
    });
  } else {
    return new PeerChat({
      chatId: -chatId,
    });
  }
}
