import { ApiUser } from '../../tdlib/types';

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
  };
}
