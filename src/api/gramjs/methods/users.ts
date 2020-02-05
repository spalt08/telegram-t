import { Api as GramJs } from '../../../lib/gramjs';
import { OnApiUpdate } from '../../types';

import { invokeRequest } from './client';
import { buildInputEntity, buildInputPeer } from '../gramjsBuilders';
import { buildApiUser } from '../apiBuilders/users';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchUserFromMessage({
  chatId, userId, messageId,
}: {
  chatId: number; userId: number; messageId: number;
}) {
  const peer = buildInputPeer(chatId);

  const users = await invokeRequest(
    new GramJs.users.GetUsers({
      id: [new GramJs.InputUserFromMessage({ peer, msgId: messageId, userId })],
    }),
  );

  if (!(users[0] instanceof GramJs.User)) {
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

  const { country } = dcInfo;

  return country;
}
