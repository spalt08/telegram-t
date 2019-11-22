import { OnUpdate } from '../types/types';

import { invokeRequest } from '../client';
import { buildApiChatFromDialog, getPeerKey } from '../builders/chats';
import { buildApiMessage } from '../builders/messages';
import { buildApiUser } from '../builders/users';
import { buildCollectionByKey } from '../../../util/iteratees';

let onUpdate: OnUpdate;

export function init(_onUpdate: OnUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchChats(
  {
    limit,
    offsetDate,
  }: {
    limit: number;
    offsetDate?: number;
  },
): Promise<{ chat_ids: number[] } | null> {
  const result = await invokeRequest({
    namespace: 'messages',
    name: 'GetDialogsRequest',
    args: {
      flags: 1,
      excludePinned: false,
      limit,
      offsetDate,
    },
  }) as MTP.messages$Dialogs;

  if (!result || !result.dialogs) {
    return null;
  }

  const lastMessagesByChatId = buildCollectionByKey((result.messages as MTP.message[]).map(buildApiMessage), 'chat_id');

  const peersByKey = preparePeers(result);
  const chats = result.dialogs.map((dialog) => {
    const peerEntity = peersByKey[getPeerKey(dialog.peer)];
    const chat = buildApiChatFromDialog(dialog, peerEntity);
    chat.last_message = lastMessagesByChatId[chat.id];
    return chat;
  });

  onUpdate({
    '@type': 'chats',
    chats,
  });

  const users = (result.users as MTP.user[]).map(buildApiUser);
  onUpdate({
    '@type': 'users',
    users,
  });

  const chatIds = chats.map((chat) => chat.id);

  return {
    chat_ids: chatIds,
  };
}

function preparePeers(result: MTP.messages$Dialogs) {
  const store: Record<string, MTP.chat | MTP.user> = {};

  result.chats.forEach((chat) => {
    store[`chat${chat.id}`] = chat as MTP.chat;
  });

  result.users.forEach((user) => {
    store[`user${user.id}`] = user as MTP.user;
  });

  return store;
}
