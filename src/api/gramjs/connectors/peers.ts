export function isPeerUser(peer: MTP.Peer): peer is MTP.peerUser {
  return peer.hasOwnProperty('userId');
}

export function isPeerChat(peer: MTP.Peer): peer is MTP.peerChat {
  return peer.hasOwnProperty('chatId');
}

export function isPeerChannel(peer: MTP.Peer): peer is MTP.peerChannel {
  return peer.hasOwnProperty('channelId');
}

export function isPeerEntityUser(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  peer: MTP.Peer, peerEntity: MTP.user | MTP.chat | MTP.channel,
): peerEntity is MTP.user {
  return isPeerUser(peer);
}

export function isPeerEntityChat(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  peer: MTP.Peer, peerEntity: MTP.user | MTP.chat | MTP.channel,
): peerEntity is MTP.chat {
  return isPeerChat(peer);
}

export function isPeerEntityChannel(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  peer: MTP.Peer, peerEntity: MTP.user | MTP.chat | MTP.channel,
): peerEntity is MTP.channel {
  return isPeerChannel(peer);
}
