import { OnUpdate } from './types';
import { provideUpdater, onRequestPhoneNumber, onRequestCode, onRequestPassword, onReady } from './auth';

const SESSION_NAME = '';

let gramjs: any;

export async function init(onUpdate: OnUpdate) {
  if (!gramjs) {
    gramjs = await import('../../lib/gramjs');
  }

  const { TelegramClient, session } = gramjs;
  const { StringSession } = session;

  const stringSession = new StringSession(SESSION_NAME);
  const client = new TelegramClient(
    stringSession,
    process.env.REACT_APP_TELEGRAM_API_ID,
    process.env.REACT_APP_TELEGRAM_API_HASH,
  );

  provideUpdater(onUpdate);

  client
    .start({
      phone: onRequestPhoneNumber,
      code: onRequestCode,
      password: onRequestPassword,
    } as any)
    .then(onReady);
}

