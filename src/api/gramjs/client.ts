import { TelegramClient, sessions, Api as GramJs } from '../../lib/gramjs';
import { Logger as GramJsLogger } from '../../lib/gramjs/extensions';

import { DEBUG } from '../../config';
import {
  onAuthReady, onRequestCode, onRequestPassword, onRequestPhoneNumber,
} from './connectors/auth';
import { onGramJsUpdate } from './onGramJsUpdate';
import queuedDownloadMedia from './connectors/media';

GramJsLogger.setLevel('warn');

let client: TelegramClient;

export async function init(sessionId: string) {
  const session = new sessions.CacheApiSession(sessionId);
  client = new TelegramClient(
    session,
    process.env.TELEGRAM_T_API_ID,
    process.env.TELEGRAM_T_API_HASH,
    { useWSS: true } as any,
  );

  client.addEventHandler(onGramJsUpdate, { build: (update: object) => update });

  try {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/client] CONNECTING');
    }

    await client.start({
      phone: onRequestPhoneNumber,
      code: onRequestCode,
      password: onRequestPassword,
    } as any);

    const newSessionId = await session.save();

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/client] CONNECTED as ', newSessionId);
    }

    onAuthReady(newSessionId);
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/client] CONNECTING ERROR', err);
    }

    throw err;
  }
}

export async function invokeRequest<T extends GramJs.AnyRequest>(request: T) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[GramJs/client] INVOKE ${request.className}`);
  }

  const result = await client.invoke(request);

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[GramJs/client] INVOKE RESPONSE ${request.className}`, result);
  }

  return result;
}

export function downloadMedia(url: string) {
  return queuedDownloadMedia(client, url);
}
