import { BigInteger } from 'big-integer';
import { Api as GramJs } from '../../lib/gramjs';

import { generateRandomBytes, readBigIntFromBuffer } from '../../lib/gramjs/Helpers';
import localDb from './localDb';

export function buildInputPeer(chatOrUserId: number): GramJs.TypePeer {
  if (chatOrUserId > 0) {
    const user = localDb.users[chatOrUserId] as GramJs.User;

    return user && new GramJs.InputPeerUser({
      userId: chatOrUserId,
      accessHash: user.accessHash as BigInteger,
    });
  } else if (chatOrUserId <= -1000000000) {
    const channel = localDb.chats[-chatOrUserId] as GramJs.Channel;

    return channel && new GramJs.InputPeerChannel({
      channelId: -chatOrUserId,
      accessHash: channel.accessHash as BigInteger,
    });
  } else {
    return new GramJs.InputPeerChat({
      chatId: -chatOrUserId,
    });
  }
}

export function buildInputPeerPhotoFileLocation(
  chatOrUserId: number,
  volumeId: GramJs.long,
  localId: number,
): GramJs.InputPeerPhotoFileLocation {
  const peer = buildInputPeer(chatOrUserId);
  return new GramJs.InputPeerPhotoFileLocation({
    peer,
    volumeId,
    localId,
  });
}

export function generateRandomBigInt() {
  return readBigIntFromBuffer(generateRandomBytes(8), false);
}
