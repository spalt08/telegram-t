import { Api as GramJs } from '../../../lib/gramjs';
import { ApiChat, ApiChatMember } from '../../types';
import { pick } from '../../../util/iteratees';
import { isPeerChat, isPeerUser } from './peers';

export function buildApiChatFromDialog(
  dialog: GramJs.Dialog,
  peerEntity: GramJs.User | GramJs.Chat | GramJs.Channel,
): ApiChat {
  const avatar = peerEntity.photo && buildAvatar(peerEntity.photo);
  const { silent, muteUntil } = dialog.notifySettings;

  return {
    id: getApiChatIdFromMtpPeer(dialog.peer),
    type: getApiChatTypeFromPeerEntity(peerEntity),
    title: getApiChatTitleFromMtpPeer(dialog.peer, peerEntity),
    lastReadOutboxMessageId: dialog.readOutboxMaxId,
    lastReadInboxMessageId: dialog.readInboxMaxId,
    ...pick(dialog, [
      'unreadCount',
      'unreadMentionsCount',
    ]),
    ...(!(peerEntity instanceof GramJs.Chat) && { username: peerEntity.username }),
    isPinned: dialog.pinned,
    ...(('verified' in peerEntity) && { isVerified: peerEntity.verified }),
    isMuted: silent || (typeof muteUntil === 'number' && Date.now() < muteUntil * 1000),
    ...(('accessHash' in peerEntity) && peerEntity.accessHash && { accessHash: peerEntity.accessHash.toString() }),
    ...(avatar && { avatar }),
    ...(!(peerEntity instanceof GramJs.User) && {
      membersCount: peerEntity.participantsCount,
      joinDate: peerEntity.date,
    }),
  };
}

export function buildApiChatFromPreview(
  preview: GramJs.TypeChat | GramJs.TypeUser,
  omitType?: boolean,
): ApiChat | undefined {
  if (
    !(preview instanceof GramJs.Chat)
    && !(preview instanceof GramJs.Channel)
    && !(preview instanceof GramJs.User)
  ) {
    return undefined;
  }

  const avatar = preview.photo && buildAvatar(preview.photo);

  const chat: ApiChat = {
    id: preview instanceof GramJs.User ? preview.id : -preview.id,
    type: getApiChatTypeFromPeerEntity(preview),
    title: preview instanceof GramJs.User ? getUserName(preview) : preview.title,
    ...(!(preview instanceof GramJs.Chat) && { username: preview.username }),
    ...(('accessHash' in preview) && preview.accessHash && { accessHash: preview.accessHash.toString() }),
    ...(avatar && { avatar }),
    ...(('verified' in preview) && { isVerified: preview.verified }),
    ...(!(preview instanceof GramJs.User) && {
      membersCount: preview.participantsCount,
      joinDate: preview.date,
    }),
  };

  if (omitType) {
    delete chat.type;
  }

  return chat;
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

export function buildAvatar(photo: any) {
  if (photo instanceof GramJs.UserProfilePhoto) {
    return { hash: photo.photoId.toString() };
  } else if (photo instanceof GramJs.ChatPhoto) {
    const { dcId, photoSmall: { volumeId, localId } } = photo;
    return { hash: `${dcId}-${volumeId}-${localId}` };
  }

  return undefined;
}

export function buildChatMember(member: GramJs.TypeChatParticipant): ApiChatMember {
  return {
    userId: member.userId,
    inviterId: 'inviterId' in member ? member.inviterId : undefined,
    joinedDate: 'date' in member ? member.date : undefined,
  };
}

export function buildChatMembers(participants: GramJs.TypeChatParticipants): ApiChatMember[] | undefined {
  if (!(participants instanceof GramJs.ChatParticipants)) {
    return undefined;
  }

  return participants.participants.map(buildChatMember);
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
