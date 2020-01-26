import BigInt from 'big-integer';
import { Api as GramJs } from '../../lib/gramjs';

import { generateRandomBytes, readBigIntFromBuffer } from '../../lib/gramjs/Helpers';

export function getEntityTypeById(chatOrUserId: number) {
  if (chatOrUserId > 0) {
    return 'user';
  } else if (chatOrUserId <= -1000000000) {
    return 'channel';
  } else {
    return 'chat';
  }
}

export function buildInputPeer(chatOrUserId: number, accessHash?: string): GramJs.TypeInputPeer {
  if (chatOrUserId > 0) {
    return new GramJs.InputPeerUser({
      userId: chatOrUserId,
      accessHash: BigInt(accessHash!),
    });
  } else if (chatOrUserId <= -1000000000) {
    return new GramJs.InputPeerChannel({
      channelId: -chatOrUserId,
      accessHash: BigInt(accessHash!),
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

export function generateRandomBigInt() {
  return readBigIntFromBuffer(generateRandomBytes(8), false);
}
