// @ts-ignore
import TdClient from 'tdweb/dist/tdweb';
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

export function init(onUpdate: Function) {
  console.log('[TdLib] INIT');

  client = new TdClient(INIT_OPTIONS);
  client.onUpdate = onUpdate;
}

export function sendParameters() {
  const apiId = process.env.REACT_APP_TELEGRAM_API_ID;
  const apiHash = process.env.REACT_APP_TELEGRAM_API_HASH;

  if (!apiId || !apiHash) {
    if (
      window.confirm(
        'API id is missing!\n' +
        'In order to obtain an API id and develop your own application ' +
        'using the Telegram API please visit https://core.telegram.org/api/obtaining_api_id',
      )
    ) {
      window.location.href = 'https://core.telegram.org/api/obtaining_api_id';
    }
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
  console.log('[TdLib] SEND', request);

  try {
    const result = await client.send(request);

    console.log('[TdLib] RECEIVE', result);

    return result;
  } catch (err) {
    // TODO Notification
    console.error('[TdLib] ERROR', err);
  }
}
