import { Api as GramJs } from '../../../lib/gramjs';
import { ApiUser, ApiUserStatus, ApiUserType } from '../../types';

export function buildApiUserFromFull(mtpUserFull: GramJs.UserFull): ApiUser {
  const { about, commonChatsCount, pinnedMsgId } = mtpUserFull;

  return {
    ...(buildApiUser(mtpUserFull.user) as ApiUser),
    fullInfo: {
      bio: about,
      commonChatsCount,
      pinnedMessageId: pinnedMsgId,
    },
  };
}

export function buildApiUser(mtpUser: GramJs.TypeUser): ApiUser | undefined {
  if (!(mtpUser instanceof GramJs.User)) {
    return undefined;
  }

  const avatar = mtpUser.photo instanceof GramJs.UserProfilePhoto
    ? { hash: mtpUser.photo.photoId.toString() }
    : undefined;

  return {
    id: mtpUser.id,
    isSelf: mtpUser.self || false,
    isVerified: mtpUser.verified || false,
    type: buildApiUserType(mtpUser),
    firstName: mtpUser.firstName,
    lastName: mtpUser.lastName,
    username: mtpUser.username || '',
    phoneNumber: mtpUser.phone || '',
    status: buildApiUserStatus(mtpUser.status),
    ...(mtpUser.accessHash && { accessHash: mtpUser.accessHash.toString() }),
    avatar,
  };
}

function buildApiUserType(user: GramJs.User): ApiUserType {
  if (user.bot) {
    return 'userTypeBot';
  }
  if (user.deleted) {
    return 'userTypeDeleted';
  }

  return 'userTypeRegular';
}

export function buildApiUserStatus(mtpStatus?: GramJs.TypeUserStatus): ApiUserStatus {
  if (!mtpStatus || mtpStatus instanceof GramJs.UserStatusEmpty) {
    return { type: 'userStatusEmpty' };
  } else if (mtpStatus instanceof GramJs.UserStatusOnline) {
    return { type: 'userStatusOnline', expires: mtpStatus.expires };
  } else if (mtpStatus instanceof GramJs.UserStatusOffline) {
    return { type: 'userStatusOffline', wasOnline: mtpStatus.wasOnline };
  } else if (mtpStatus instanceof GramJs.UserStatusRecently) {
    return { type: 'userStatusRecently' };
  } else if (mtpStatus instanceof GramJs.UserStatusLastWeek) {
    return { type: 'userStatusLastWeek' };
  } else {
    return { type: 'userStatusLastMonth' };
  }
}
