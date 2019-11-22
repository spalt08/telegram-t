import { isPeerChat, isPeerUser } from './peers';
import { ApiChat } from '../../tdlib/types';
import { buildPhoto } from './common';

export function buildApiChatFromDialog(dialog: MTP.dialog, peerEntity: MTP.user | MTP.chat): ApiChat {
  return {
    id: getApiChatIdFromMtpPeer(dialog.peer),
    type: {
      '@type': getApiChatTypeFromMtpPeer(dialog.peer),
      ...(isPeerUser(dialog.peer) && { user_id: dialog.peer.userId }),
    },
    title: getApiChatTitleFromMtpPeer(dialog.peer, peerEntity),
    photo_locations: buildPhoto(peerEntity),
    last_read_outbox_message_id: dialog.readOutboxMaxId,
    last_read_inbox_message_id: dialog.readInboxMaxId,
    unread_count: dialog.unreadCount,
    unread_mention_count: 0, // TODO
    order: '1', // TODO
    is_pinned: false, // TODO,
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

export function getPeerKey(peer: MTP.Peer) {
  if (isPeerUser(peer)) {
    return `user${peer.userId}`;
  } else if (isPeerChat(peer)) {
    return `chat${peer.chatId}`;
  } else {
    return `chat${peer.channelId}`;
  }
}

export function getApiChatTitleFromMtpPeer(peer: MTP.Peer, peerEntity: MTP.user | MTP.chat) {
  if (isPeerUser(peer)) {
    return getUserName(peerEntity as MTP.user);
  } else {
    return (peerEntity as MTP.chat).title;
  }
}

function getUserName(user: MTP.user) {
  return user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : undefined;
}
