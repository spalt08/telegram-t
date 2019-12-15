import BigInt from 'big-integer';
import { Api as GramJs } from '../../lib/gramjs';

import { generateRandomBytes, readBigIntFromBuffer } from '../../lib/gramjs/Helpers';

export function buildInputPeer(chatOrUserId: number, accessHash: string): GramJs.TypePeer {
  if (chatOrUserId > 0) {
    return new GramJs.InputPeerUser({
      userId: chatOrUserId,
      accessHash: BigInt(accessHash),
    });
  } else if (chatOrUserId <= -1000000000) {
    return new GramJs.InputPeerChannel({
      channelId: -chatOrUserId,
      accessHash: BigInt(accessHash),
    });
  } else {
    return new GramJs.InputPeerChat({
      chatId: -chatOrUserId,
    });
  }
}

// export function buildInputPeerPhotoFileLocation(
//   chatOrUserId: number,
//   volumeId: GramJs.long,
//   localId: number,
// ): GramJs.InputPeerPhotoFileLocation {
//   const peer = buildInputPeer(chatOrUserId);
//   return new GramJs.InputPeerPhotoFileLocation({
//     peer,
//     volumeId,
//     localId,
//   });
// }

export function generateRandomBigInt() {
  return readBigIntFromBuffer(generateRandomBytes(8), false);
}
