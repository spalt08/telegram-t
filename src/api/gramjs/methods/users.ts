import { Api as GramJs } from '../../../lib/gramjs';
import { OnApiUpdate, ApiUser } from '../../types';

import { invokeRequest, uploadFile } from './client';
import { buildInputEntity, calculateResultHash } from '../gramjsBuilders';
import { buildApiUser } from '../apiBuilders/users';
import localDb from '../localDb';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchFullUser({
  id,
  accessHash,
}: {
  id: number;
  accessHash?: string;
}) {
  const input = buildInputEntity(id, accessHash);
  if (!(input instanceof GramJs.InputUser)) {
    return;
  }
  const fullInfo = await invokeRequest(new GramJs.users.GetFullUser({ id: input }));

  if (!fullInfo) {
    return;
  }

  const { about, commonChatsCount, pinnedMsgId } = fullInfo;

  onUpdate({
    '@type': 'updateUser',
    id,
    user: {
      full_info: {
        bio: about,
        common_chats_count: commonChatsCount,
        pinned_message_id: pinnedMsgId,
      },
    },
  });
}

export async function fetchNearestCountry() {
  const dcInfo = await invokeRequest(new GramJs.help.GetNearestDc());

  return dcInfo ? dcInfo.country : undefined;
}

export async function uploadProfilePhoto(file: File) {
  const inputFile = await uploadFile(file);
  const request = new GramJs.photos.UploadProfilePhoto({ file: inputFile });
  await invokeRequest(request);
}

export async function fetchTopUsers({ hash = 0 }: { hash?: number }) {
  const topPeers = await invokeRequest(new GramJs.contacts.GetTopPeers({
    hash,
    correspondents: true,
  }));
  if (!(topPeers instanceof GramJs.contacts.TopPeers)) {
    return undefined;
  }

  const users = topPeers.users.map(buildApiUser).filter((user) => !!user && !user.is_self) as ApiUser[];

  return {
    hash: calculateResultHash(users.map(({ id }) => id)),
    users,
  };
}

export async function fetchContactList({ hash = 0 }: { hash?: number }) {
  const result = await invokeRequest(new GramJs.contacts.GetContacts({ hash }));
  if (!result || result instanceof GramJs.contacts.ContactsNotModified) {
    return undefined;
  }

  result.users.forEach((user) => {
    if (user instanceof GramJs.User) {
      localDb.users[user.id] = user;
    }
  });

  return {
    hash: calculateResultHash([
      result.savedCount,
      ...result.contacts.map(({ userId }) => userId),
    ]),
    users: result.users.map(buildApiUser).filter<ApiUser>(Boolean as any),
  };
}
