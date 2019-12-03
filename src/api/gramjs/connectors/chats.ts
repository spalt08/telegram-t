import { Api as GramJs } from '../../../lib/gramjs';

import { OnApiUpdate } from '../types';
import { invokeRequest } from '../client';
import { buildApiChatFromDialog, getApiChatIdFromMtpPeer, getPeerKey } from '../builders/chats';
import { buildApiMessage } from '../builders/messages';
import { buildApiUser } from '../builders/users';
import { buildCollectionByKey } from '../../../util/iteratees';
import { loadAvatar } from './files';
import localDb from '../localDb';
import { UNSUPPORTED_RESPONSE } from '../utils';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
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
  const result = await invokeRequest(new GramJs.messages.GetDialogs({
    offsetPeer: new GramJs.InputPeerEmpty({}),
    limit,
    offsetDate,
  }));

  if (!result || !(result instanceof GramJs.messages.DialogsSlice) || !result.dialogs.length) {
    throw new Error(UNSUPPORTED_RESPONSE);
  }

  updateLocalDb(result);

  const lastMessagesByChatId = buildCollectionByKey(result.messages.map(buildApiMessage), 'chat_id');
  const peersByKey = preparePeers(result);
  const chats = result.dialogs.map((dialog) => {
    const peerEntity = peersByKey[getPeerKey(dialog.peer)];
    const chat = buildApiChatFromDialog(dialog as GramJs.Dialog, peerEntity);
    chat.last_message = lastMessagesByChatId[chat.id];
    return chat;
  });

  onUpdate({
    '@type': 'chats',
    chats,
  });

  const users = (result.users as GramJs.User[]).map(buildApiUser);
  onUpdate({
    '@type': 'users',
    users,
  });

  loadAvatars(result);

  const chatIds = chats.map((chat) => chat.id);

  return {
    chat_ids: chatIds,
  };
}

function preparePeers(result: GramJs.messages.DialogsSlice) {
  const store: Record<string, GramJs.Chat | GramJs.User> = {};

  result.chats.forEach((chat) => {
    store[`chat${chat.id}`] = chat as GramJs.Chat;
  });

  result.users.forEach((user) => {
    store[`user${user.id}`] = user as GramJs.User;
  });

  return store;
}

function updateLocalDb(result: GramJs.messages.DialogsSlice) {
  result.users.forEach((user) => {
    localDb.users[user.id] = user as GramJs.User;
  });

  result.chats.forEach((chat) => {
    localDb.chats[chat.id] = chat as GramJs.Chat | GramJs.Channel;
  });
}

function loadAvatars(result: GramJs.messages.DialogsSlice) {
  result.users.forEach((user) => {
    loadAvatar(user as GramJs.User).then((dataUri) => {
      if (!dataUri) {
        return;
      }

      onUpdate({
        '@type': 'updateAvatar',
        chat_id: getApiChatIdFromMtpPeer({ userId: user.id } as GramJs.TypePeer),
        data_uri: dataUri,
      });
    });
  });

  result.chats.forEach((chat) => {
    loadAvatar(chat as GramJs.Chat).then((dataUri) => {
      if (!dataUri) {
        return;
      }

      onUpdate({
        '@type': 'updateAvatar',
        chat_id: getApiChatIdFromMtpPeer({ chatId: chat.id } as GramJs.TypePeer),
        data_uri: dataUri,
      });
    });
  });
}
