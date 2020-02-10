import { Api as GramJs } from '../../../lib/gramjs';
import { ApiChat, OnApiUpdate } from '../../types';

import { invokeRequest, uploadFile } from './client';
import { buildInputEntity, buildInputPeer } from '../gramjsBuilders';
import { buildApiUser } from '../apiBuilders/users';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchUserFromMessage({
  chat, userId, messageId,
}: {
  chat: ApiChat; userId: number; messageId: number;
}) {
  const users = await invokeRequest(
    new GramJs.users.GetUsers({
      id: [new GramJs.InputUserFromMessage({
        peer: buildInputPeer(chat.id, chat.access_hash),
        msgId: messageId,
        userId,
      })],
    }),
  );

  if (!users || !(users[0] instanceof GramJs.User)) {
    return;
  }

  const user = buildApiUser(users[0]);

  onUpdate({
    '@type': 'updateUser',
    id: user.id,
    user,
  });
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
