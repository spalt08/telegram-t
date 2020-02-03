import {
  TelegramClient, sessions, Api as GramJs, connection,
} from '../../../lib/gramjs';
import { Logger as GramJsLogger } from '../../../lib/gramjs/extensions/index';

import { DEBUG, DEBUG_GRAMJS } from '../../../config';
import {
  onRequestPhoneNumber, onRequestCode, onRequestPassword, onRequestRegistration,
  onAuthError, onAuthReady, onCurrentUserId,
} from './auth';
import { updater } from '../updater';
import queuedDownloadMedia from './media';

GramJsLogger.setLevel(DEBUG_GRAMJS ? 'debug' : 'warn');

const gramJsUpdateEventBuilder = { build: (update: object) => update };

let client: TelegramClient;
let isConnected = false;

export async function init(sessionId: string) {
  const session = new sessions.CacheApiSession(sessionId);
  client = new TelegramClient(
    session,
    process.env.TELEGRAM_T_API_ID,
    process.env.TELEGRAM_T_API_HASH,
    { useWSS: true } as any,
  );

  client.addEventHandler(onUpdate, gramJsUpdateEventBuilder);
  client.addEventHandler(updater, gramJsUpdateEventBuilder);

  try {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/client] CONNECTING');
    }

    await client.start({
      phoneNumber: onRequestPhoneNumber,
      phoneCode: onRequestCode,
      password: onRequestPassword,
      firstAndLastNames: onRequestRegistration,
      onError: onAuthError,
    });

    const newSessionId = await session.save();

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/client] CONNECTED as ', newSessionId);
    }

    onAuthReady(newSessionId);
    void loadCurrentUser();
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[GramJs/client] CONNECTING ERROR', err);
    }

    throw err;
  }
}

export async function destroy() {
  await client.destroy();
}

function onUpdate(update: any) {
  if (update instanceof connection.UpdateConnectionState) {
    isConnected = update.state === connection.UpdateConnectionState.states.connected;
  }
}

export async function invokeRequest<T extends GramJs.AnyRequest>(request: T, shouldHandleUpdates = false) {
  if (DEBUG) {
    if (!isConnected) {
      // eslint-disable-next-line no-console
      console.warn(`[GramJs/client] INVOKE ${request.className} ERROR: Client is not connected`);
      return undefined;
    }

    // eslint-disable-next-line no-console
    console.log(`[GramJs/client] INVOKE ${request.className}`);
  }

  const result = await client.invoke(request);

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[GramJs/client] INVOKE RESPONSE ${request.className}`, result);
  }

  if (shouldHandleUpdates) {
    if (result instanceof GramJs.Updates || result instanceof GramJs.UpdatesCombined) {
      result.updates.forEach((update) => updater(update, request));
    } else if (result instanceof GramJs.UpdatesTooLong) {
      // TODO Implement
    } else {
      updater(result as GramJs.TypeUpdates, request);
    }
  }

  return result;
}

export function downloadMedia(url: string) {
  if (!isConnected) {
    return Promise.reject(new Error('ERROR: Client is not connected'));
  }

  return queuedDownloadMedia(client, url);
}

export function uploadFile(file: File, onProgress: (progress: number) => void) {
  return client.uploadFile({ file, onProgress });
}

async function loadCurrentUser() {
  const users = await invokeRequest(new GramJs.users.GetUsers({
    id: [new GramJs.InputUserSelf()],
  }));

  if (!users || !users.length) {
    return;
  }

  onCurrentUserId(users[0].id);
}