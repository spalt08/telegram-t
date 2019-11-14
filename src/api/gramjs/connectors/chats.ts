import { isPeerChat, isPeerUser } from './peers';

export function buildApiChatFromDialog(dialog: MTP.dialog) {
  return {
    id: getApiChatIdFromMtpPeer(dialog.peer),
    type: {
      '@type': getApiChatTypeFromMtpPeer(dialog.peer),
      ...(isPeerUser(dialog.peer) && { user_id: dialog.peer.userId }),
    },
    title: getApiChatTitleFromMtpPeer(dialog.peer),
    last_read_outbox_message_id: dialog.readOutboxMaxId,
    last_read_inbox_message_id: dialog.readInboxMaxId,
    unread_count: dialog.unreadCount,
    unread_mention_count: 0, // TODO
    order: '1', // TODO
    // photo: {// TODO
    //   small: {},
    //   big: {},
    // },
  };
}

export function getApiChatIdFromMtpPeer(peer: MTP.Peer) {
  if (isPeerUser(peer)) {
    return peer.userId;
  } else if (isPeerChat(peer)) {
    return -peer.chatId;
  } else {
    return -peer.channelId;
  }
}

export function getApiChatTypeFromMtpPeer(peer: MTP.Peer) {
  if (isPeerUser(peer)) {
    return 'chatTypePrivate';
  } else if (isPeerChat(peer)) {
    return 'chatTypeBasicGroup';
  } else {
    // TODO Support channels, supergroups, etc.
    return 'chatTypeBasicGroup';
  }
}

export function getApiChatTitleFromMtpPeer(peer: MTP.Peer) {
  const id = getApiChatIdFromMtpPeer(peer);

  if (isPeerUser(peer)) {
    return `User #${id}`;
  } else if (isPeerChat(peer)) {
    return `Chat #${id}`;
  } else {
    // TODO Support channels, supergroups, etc.
    return `Channel #${id}`;
  }
}
