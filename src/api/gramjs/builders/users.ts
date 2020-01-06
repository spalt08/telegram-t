import { Api as GramJs } from '../../../lib/gramjs';
import { ApiUser, ApiUserStatus, ApiUserType } from '../../types';

export function buildApiUser(mtpUser: GramJs.User): ApiUser {
  const avatar = mtpUser.photo instanceof GramJs.UserProfilePhoto
    && { hash: mtpUser.photo.photoId.toString() };

  return {
    id: mtpUser.id,
    is_self: mtpUser.self,
    type: buildApiUserType(mtpUser),
    first_name: mtpUser.firstName,
    last_name: mtpUser.lastName,
    username: mtpUser.username || '',
    phone_number: mtpUser.phone || '',
    status: buildApiUserStatus(mtpUser.status),
    ...(mtpUser.accessHash && { access_hash: mtpUser.accessHash.toString() }),
    ...(avatar && { avatar }),
  };
}

function buildApiUserType(user: GramJs.User): ApiUserType {
  if (user.bot) {
    return { '@type': 'userTypeBot' };
  }
  if (user.deleted) {
    return { '@type': 'userTypeDeleted' };
  }

  return { '@type': 'userTypeRegular' };
}

export function buildApiUserStatus(mtpStatus?: GramJs.TypeUserStatus): ApiUserStatus | undefined {
  if (!mtpStatus || mtpStatus instanceof GramJs.UserStatusEmpty) {
    return { '@type': 'userStatusEmpty' };
  } else if (mtpStatus instanceof GramJs.UserStatusOnline) {
    return { '@type': 'userStatusOnline' };
  } else if (mtpStatus instanceof GramJs.UserStatusOffline) {
    return { '@type': 'userStatusOffline', was_online: mtpStatus.wasOnline };
  } else if (mtpStatus instanceof GramJs.UserStatusRecently) {
    return { '@type': 'userStatusRecently' };
  } else if (mtpStatus instanceof GramJs.UserStatusLastWeek) {
    return { '@type': 'userStatusLastWeek' };
  } else {
    return { '@type': 'userStatusLastMonth' };
  }
}
