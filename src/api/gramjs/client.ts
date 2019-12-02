import {
  TelegramClient, session, GramJsApi, MTProto,
} from '../../lib/gramjs';
import { Logger as GramJsLogger } from '../../lib/gramjs/extensions';

import { DEBUG } from '../../config';
import {
  onAuthReady, onRequestCode, onRequestPassword, onRequestPhoneNumber,
} from './connectors/auth';
import { onGramJsUpdate } from './onGramJsUpdate';

GramJsLogger.getLogger().level = 'debug';

let client: TelegramClient;

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

export async function invokeRequest<T extends InstanceType<GramJsApi.AnyRequest>>(request: T) {
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

export function downloadAvatar(entity: MTProto.chat | MTProto.user, isBig = false) {
  return client.downloadProfilePhoto(entity, isBig);
}

export function downloadMessageImage(message: MTProto.message) {
  return client.downloadMedia(message, { sizeType: 'x' });
}
