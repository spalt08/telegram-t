import { Api as GramJs } from '../../../lib/gramjs';
import { ApiUser, ApiUserStatus } from '../../types';
import { buildApiPhotoLocations } from './common';

export function buildApiUser(mtpUser: GramJs.User): ApiUser {
  return {
    id: mtpUser.id,
    type: {
      // TODO Support other user types.
      '@type': 'userTypeRegular',
    },
    first_name: mtpUser.firstName,
    last_name: mtpUser.lastName,
    username: mtpUser.username || '',
    phone_number: mtpUser.phone || '',
    profile_photo_locations: buildApiPhotoLocations(mtpUser),
    status: buildApiUserStatus(mtpUser.status),
  };
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
