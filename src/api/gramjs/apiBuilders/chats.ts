import { Api as GramJs } from '../../../lib/gramjs';
import { ApiChat, ApiChatMember } from '../../types';
import { isPeerChat, isPeerUser } from './peers';

export function buildApiChatFromDialog(
  dialog: GramJs.Dialog,
  peerEntity: GramJs.User | GramJs.Chat | GramJs.Channel,
): ApiChat {
  const avatar = peerEntity.photo && buildAvatar(peerEntity.photo);
  const { silent, muteUntil } = dialog.notifySettings;

  return {
    id: getApiChatIdFromMtpPeer(dialog.peer),
    type: {
      '@type': getApiChatTypeFromPeerEntity(peerEntity),
    },
    title: getApiChatTitleFromMtpPeer(dialog.peer, peerEntity),
    last_read_outbox_message_id: dialog.readOutboxMaxId,
    last_read_inbox_message_id: dialog.readInboxMaxId,
    unread_count: dialog.unreadCount,
    unread_mention_count: dialog.unreadMentionsCount,
    ...(!(peerEntity instanceof GramJs.Chat) && { username: peerEntity.username }),
    is_pinned: dialog.pinned || false,
    is_verified: (('verified' in peerEntity) && peerEntity.verified) || false,
    is_muted: silent || (typeof muteUntil === 'number' && Date.now() < muteUntil * 1000),
    ...(('accessHash' in peerEntity) && peerEntity.accessHash && { access_hash: peerEntity.accessHash.toString() }),
    ...(avatar && { avatar }),
  };
}

export function getApiChatIdFromMtpPeer(peer: GramJs.TypePeer): number {
  if (isPeerUser(peer)) {
    return peer.userId;
  } else if (isPeerChat(peer)) {
    return -peer.chatId;
  } else {
    return -peer.channelId;
  }
}

export function getApiChatTypeFromPeerEntity(peerEntity: GramJs.User | GramJs.Chat | GramJs.Channel) {
  if (peerEntity instanceof GramJs.User) {
    return 'chatTypePrivate';
  } else if (peerEntity instanceof GramJs.Chat) {
    return 'chatTypeBasicGroup';
  } else {
    return peerEntity.megagroup ? 'chatTypeSuperGroup' : 'chatTypeChannel';
  }
}

export function getPeerKey(peer: GramJs.TypePeer) {
  if (isPeerUser(peer)) {
    return `user${peer.userId}`;
  } else if (isPeerChat(peer)) {
    return `chat${peer.chatId}`;
  } else {
    return `chat${peer.channelId}`;
  }
}

export function getApiChatTitleFromMtpPeer(peer: GramJs.TypePeer, peerEntity: GramJs.User | GramJs.Chat) {
  if (isPeerUser(peer)) {
    return getUserName(peerEntity as GramJs.User);
  } else {
    return (peerEntity as GramJs.Chat).title;
  }
}

function getUserName(user: GramJs.User) {
  return user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : undefined;
}

function buildAvatar(photo: any) {
  if (photo instanceof GramJs.UserProfilePhoto) {
    return { hash: photo.photoId.toString() };
  } else if (photo instanceof GramJs.ChatPhoto) {
    const { dcId, photoSmall: { volumeId, localId } } = photo;
    return { hash: `${dcId}-${volumeId}-${localId}` };
  }

  return null;
}

export function buildChatMembers(participants: GramJs.TypeChatParticipants): ApiChatMember[] | undefined {
  if (!(participants instanceof GramJs.ChatParticipants)) {
    return undefined;
  }

  return participants.participants.map((member) => ({
    '@type': 'chatMember',
    user_id: member.userId,
    inviter_id: 'inviterId' in member ? member.inviterId : undefined,
    joined_date: 'date' in member ? member.date : undefined,
  }));
}

export function buildChatInviteLink(exportedInvite: GramJs.TypeExportedChatInvite) {
  return exportedInvite instanceof GramJs.ChatInviteExported
    ? exportedInvite.link
    : undefined;
}

export function buildChatTypingStatus(update: GramJs.UpdateUserTyping | GramJs.UpdateChatUserTyping) {
  let action: string = '';
  if (update.action instanceof GramJs.SendMessageCancelAction) {
    return undefined;
  } else if (update.action instanceof GramJs.SendMessageTypingAction) {
    action = 'typing';
  } else if (update.action instanceof GramJs.SendMessageRecordVideoAction) {
    action = 'recording a video';
  } else if (update.action instanceof GramJs.SendMessageUploadVideoAction) {
    action = 'uploading a video';
  } else if (update.action instanceof GramJs.SendMessageRecordAudioAction) {
    action = 'recording a voice message';
  } else if (update.action instanceof GramJs.SendMessageUploadAudioAction) {
    action = 'uploading a voice message';
  } else if (update.action instanceof GramJs.SendMessageUploadPhotoAction) {
    action = 'uploading a photo';
  } else if (update.action instanceof GramJs.SendMessageUploadDocumentAction) {
    action = 'uploading a file';
  } else if (update.action instanceof GramJs.SendMessageGeoLocationAction) {
    action = 'selecting a location to share';
  } else if (update.action instanceof GramJs.SendMessageChooseContactAction) {
    action = 'selecting a contact to share';
  } else if (update.action instanceof GramJs.SendMessageGamePlayAction) {
    action = 'playing a game';
  } else if (update.action instanceof GramJs.SendMessageRecordRoundAction) {
    action = 'recording a round video';
  } else if (update.action instanceof GramJs.SendMessageUploadRoundAction) {
    action = 'uploading a round video';
  }

  return {
    action,
    ...(update instanceof GramJs.UpdateChatUserTyping && { userId: update.userId }),
    timestamp: Date.now(),
  };
}
