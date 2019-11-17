import { SendToWorker } from '../types/types';
import { ApiChat } from '../../tdlib/types';

let sendToClient: SendToWorker;

export function init(_sendToClient: SendToWorker) {
  sendToClient = _sendToClient;
}

export async function loadFile(chat: ApiChat): Promise<string | null> {
  const result = await sendToClient({
    type: 'invokeRequest',
    namespace: 'upload',
    name: 'GetFileRequest',
    args: {
      flags: 0,
      offset: 0,
      limit: 1024 * 1024,
    },
    enhancers: {
      location: ['buildInputPeerPhotoFileLocation', chat],
    },
  }, true);

  // eslint-disable-next-line no-underscore-dangle
  return result && result._bytes ? bytesToUrl(result._bytes) : null;
}

function bytesToUrl(bytes: Uint8Array, mimeType?: string) {
  if (!mimeType) {
    mimeType = 'image/jpg';
  }

  return `data:${mimeType};base64,${btoa(
    bytes.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''),
  )}`;
}
