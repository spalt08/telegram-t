import { Api as GramJs } from '../../../lib/gramjs';
import { OnApiUpdate } from '../../types';

import { invokeRequest } from '../client';
import { buildInputEntity } from '../inputHelpers';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchFullUser(
  {
    id,
    accessHash,
  }: {
    id: number;
    accessHash?: string;
  },
) {
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
