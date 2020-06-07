import { Api as GramJs } from '../../../lib/gramjs';
import { OnApiUpdate, ApiUser, ApiChat } from '../../types';

import { invokeRequest, uploadFile } from './client';
import {
  buildInputEntity,
  calculateResultHash,
  buildInputPeer,
} from '../gramjsBuilders';
import { buildApiUser } from '../apiBuilders/users';
import localDb from '../localDb';
import { buildApiChatFromPreview } from '../apiBuilders/chats';

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
      fullInfo: {
        bio: about,
        commonChatsCount,
        pinnedMessageId: pinnedMsgId,
      },
    },
  });
}

export async function fetchNearestCountry() {
  const dcInfo = await invokeRequest(new GramJs.help.GetNearestDc());

  return dcInfo ? dcInfo.country : undefined;
}

export function updateProfile({
  firstName,
  lastName,
  about,
}: {
  firstName?: string;
  lastName?: string;
  about?: string;
}) {
  // This endpoint handles empty strings with an unexpected error, so we replace them with `undefined`
  return invokeRequest(new GramJs.account.UpdateProfile({
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    about: about || undefined,
  }));
}

export function checkUsername(username: string) {
  return invokeRequest(new GramJs.account.CheckUsername({ username }));
}

export function updateUsername(username: string) {
  return invokeRequest(new GramJs.account.UpdateUsername({ username }));
}

export async function updateProfilePhoto(file: File) {
  const inputFile = await uploadFile(file);
  return invokeRequest(new GramJs.photos.UploadProfilePhoto({
    file: inputFile,
  }));
}

export async function uploadProfilePhoto(file: File) {
  const inputFile = await uploadFile(file);
  await invokeRequest(new GramJs.photos.UploadProfilePhoto({
    file: inputFile,
  }));
}

export async function fetchTopUsers({ hash = 0 }: { hash?: number }) {
  const topPeers = await invokeRequest(new GramJs.contacts.GetTopPeers({
    hash,
    correspondents: true,
  }));
  if (!(topPeers instanceof GramJs.contacts.TopPeers)) {
    return undefined;
  }

  const users = topPeers.users.map(buildApiUser).filter((user) => !!user && !user.isSelf) as ApiUser[];

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
    chats: result.users.map((user) => buildApiChatFromPreview(user)).filter<ApiChat>(Boolean as any),
  };
}

export async function fetchUsers({ users } : { users: ApiUser[] }) {
  const result = await invokeRequest(new GramJs.users.GetUsers({
    id: users.map(({ id, accessHash }) => buildInputPeer(id, accessHash)),
  }));
  if (!result || !result.length) {
    return undefined;
  }

  result.forEach((user) => {
    if (user instanceof GramJs.User) {
      localDb.users[user.id] = user;
    }
  });

  return result.map(buildApiUser).filter<ApiUser>(Boolean as any);
}
