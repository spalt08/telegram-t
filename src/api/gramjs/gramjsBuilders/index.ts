import BigInt from 'big-integer';
import { Api as GramJs } from '../../../lib/gramjs';

import { generateRandomBytes, readBigIntFromBuffer } from '../../../lib/gramjs/Helpers';
import { ApiSticker, ApiVideo } from '../../types';
import localDb from '../localDb';

const WAVEFORM_LENGTH = 63;
const WAVEFORM_MAX_VALUE = 255;

export function getEntityTypeById(chatOrUserId: number) {
  if (chatOrUserId > 0) {
    return 'user';
  } else if (chatOrUserId <= -1000000000) {
    return 'channel';
  } else {
    return 'chat';
  }
}

export function buildPeer(chatOrUserId: number): GramJs.TypePeer {
  if (chatOrUserId > 0) {
    return new GramJs.PeerUser({
      userId: chatOrUserId,
    });
  } else if (chatOrUserId <= -1000000000) {
    return new GramJs.PeerChannel({
      channelId: -chatOrUserId,
    });
  } else {
    return new GramJs.PeerChat({
      chatId: -chatOrUserId,
    });
  }
}

export function buildInputPeer(chatOrUserId: number, accessHash?: string): GramJs.TypeInputPeer {
  if (chatOrUserId > 0 || chatOrUserId <= -1000000000) {
    if (!accessHash) {
      throw new Error('Missing `accessHash`');
    }

    return chatOrUserId > 0
      ? new GramJs.InputPeerUser({
        userId: chatOrUserId,
        accessHash: BigInt(accessHash),
      })
      : new GramJs.InputPeerChannel({
        channelId: -chatOrUserId,
        accessHash: BigInt(accessHash),
      });
  } else {
    return new GramJs.InputPeerChat({
      chatId: -chatOrUserId,
    });
  }
}

export function buildInputEntity(chatOrUserId: number, accessHash?: string) {
  if (chatOrUserId > 0) {
    return new GramJs.InputUser({
      userId: chatOrUserId,
      accessHash: BigInt(accessHash!),
    });
  } else if (chatOrUserId <= -1000000000) {
    return new GramJs.InputChannel({
      channelId: -chatOrUserId,
      accessHash: BigInt(accessHash!),
    });
  } else {
    return -chatOrUserId;
  }
}

export function buildInputStickerSet(id: string, accessHash: string) {
  return new GramJs.InputStickerSetID({
    id: BigInt(id),
    accessHash: BigInt(accessHash),
  });
}

export function buildInputMediaDocument(media: ApiSticker | ApiVideo) {
  const document = localDb.documents[media.id];

  if (!document) {
    return undefined;
  }

  const { id, accessHash, fileReference } = document;

  const inputDocument = new GramJs.InputDocument({
    id,
    accessHash,
    fileReference,
  });

  return new GramJs.InputMediaDocument({ id: inputDocument });
}

export function generateRandomBigInt() {
  return readBigIntFromBuffer(generateRandomBytes(8), false);
}

export function reduceWaveform(waveform: number[]) {
  const reduced: number[] = new Array(WAVEFORM_LENGTH).fill(0);
  const precision = Math.ceil(waveform.length / WAVEFORM_LENGTH);
  let max = 0;

  for (let i = 0; i < WAVEFORM_LENGTH + 1; i++) {
    const part = waveform.slice(i * precision, (i + 1) * precision);
    if (!part.length) {
      break;
    }

    const sum = part.reduce((acc, spike) => acc + spike, 0);
    const value = sum / part.length;
    reduced[i] = value;
    if (value > max) {
      max = value;
    }
  }

  return reduced.map((v) => Math.round((v / max) * WAVEFORM_MAX_VALUE));
}

export function buildMessageFromUpdateShortSent(
  id: number,
  chatId: number,
  update: GramJs.UpdateShortSentMessage,
) {
  // This is not a proper message, but we only need these fields for downloading media through `localDb`.
  return new GramJs.Message({
    id,
    toId: buildPeer(chatId),
    fromId: chatId,
    media: update.media,
  } as GramJs.Message);
}
