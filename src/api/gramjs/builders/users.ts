import * as gramJsApi from '../../../lib/gramjs/tl/types';
import { ApiUser, ApiUserStatus } from '../../types';
import { buildPhoto } from './common';

export function buildApiUser(mtpUser: MTP.user): ApiUser {
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
    profile_photo_locations: buildPhoto(mtpUser),
    status: buildApiUserStatus(mtpUser.status),
  };
}

export function buildApiUserStatus(mtpStatus?: MTP.UserStatus): ApiUserStatus | undefined {
  if (!mtpStatus || mtpStatus instanceof gramJsApi.UserStatusEmpty) {
    return { '@type': 'userStatusEmpty' };
  } else if (mtpStatus instanceof gramJsApi.UserStatusOnline) {
    return { '@type': 'userStatusOnline' };
  } else if (mtpStatus instanceof gramJsApi.UserStatusOffline) {
    return { '@type': 'userStatusOffline', was_online: mtpStatus.wasOnline };
  } else if (mtpStatus instanceof gramJsApi.UserStatusRecently) {
    return { '@type': 'userStatusRecently' };
  } else if (mtpStatus instanceof gramJsApi.UserStatusLastWeek) {
    return { '@type': 'userStatusLastWeek' };
  } else if (mtpStatus instanceof gramJsApi.UserStatusLastMonth) {
    return { '@type': 'userStatusLastMonth' };
  }

  return undefined;
}
