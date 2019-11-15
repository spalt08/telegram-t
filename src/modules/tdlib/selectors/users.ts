import { GlobalState } from '../../../lib/teactn';
import { ApiUser } from '../../../api/tdlib/types';

import { getUserPhotoId } from '../helpers';

export function selectUser(global: GlobalState, userId: number) {
  return global.users.byId[userId];
}

export function selectUserPhotoUrl(global: GlobalState, user: ApiUser) {
  const fileId = getUserPhotoId(user);

  if (!fileId) {
    return null;
  }

  const file = global.files.byId[fileId];

  if (!file || !file.blobUrl) {
    return null;
  }

  return file && file.blobUrl ? file.blobUrl : null;
}
