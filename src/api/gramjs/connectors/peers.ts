export function isPeerUser(peer: MTP.Peer): peer is MTP.peerUser {
  return peer.hasOwnProperty('userId');
}

export function isPeerChat(peer: MTP.Peer): peer is MTP.peerChat {
  return peer.hasOwnProperty('chatId');
}

export function isPeerChannel(peer: MTP.Peer): peer is MTP.peerChannel {
  return peer.hasOwnProperty('channelId');
}
