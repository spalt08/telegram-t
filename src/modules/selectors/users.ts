import { ApiUser } from '../../api/types';
import { GlobalState } from '../../store/types';
import { getUserPhotoKey } from '../helpers';

export function selectUser(global: GlobalState, userId: number) {
  return global.users.byId[userId];
}

export function selectUserPhotoUrl(global: GlobalState, user: ApiUser) {
  const fileKey = getUserPhotoKey(user);

  if (!fileKey) {
    return null;
  }

  const file = global.files.byKey[fileKey];

  if (!file || !file.dataUri) {
    return null;
  }

  return file && file.dataUri ? file.dataUri : null;
}
