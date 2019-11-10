import { DEBUG } from '../../config';
import { getBrowser, getOsName } from './utils';

let client: any;

const INIT_OPTIONS = {
  logVerbosityLevel: 1,
  jsLogVerbosityLevel: 3,
  mode: 'wasm',
  prefix: 'tdlib',
  readOnly: false,
  isBackground: false,
  useDatabase: false,
};

const TD_PARAMETERS = {
  '@type': 'tdParameters',
  use_test_dc: false,
  system_language_code: navigator.language || 'en',
  device_model: getBrowser(),
  system_version: getOsName(),
  application_version: '0.0.1',
  use_secret_chats: false,
  use_message_database: true,
  use_file_database: false,
  database_directory: '/db',
  files_directory: '/',
};

let TdClient: any;

export async function init(onUpdate: Function) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[TdLib] INIT');
  }

  if (!TdClient) {
    // @ts-ignore
    const module = await import('tdweb/dist/tdweb');
    TdClient = module.default;
  }

  client = new TdClient(INIT_OPTIONS);
  client.onUpdate = onUpdate;
}

export function sendParameters() {
  const apiId = process.env.REACT_APP_TELEGRAM_API_ID;
  const apiHash = process.env.REACT_APP_TELEGRAM_API_HASH;

  if (!apiId || !apiHash) {
    throw new Error('Provide `REACT_APP_TELEGRAM_API_ID` and `REACT_APP_TELEGRAM_API_HASH` env vars.');
  }

  send({
    '@type': 'setTdlibParameters',
    parameters: {
      ...TD_PARAMETERS,
      api_id: apiId,
      api_hash: apiHash,
    },
  });
}

// TODO Types.
export async function send(request: any) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[TdLib] SEND', request);
  }

  try {
    const result = await client.send(request);

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[TdLib] RECEIVE', result);
    }

    return result;
  } catch (err) {
    // TODO Notification
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('[TdLib] ERROR', err);
    }

    return null;
  }
}
