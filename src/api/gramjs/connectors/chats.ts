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
import { ApiChat } from '../../types';

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

  // I had to change it to Dialogs to work for me.
  if (!result || !(result instanceof GramJs.messages.DialogsSlice
      || result instanceof GramJs.messages.Dialogs) || !result.dialogs.length) {
    throw new Error(UNSUPPORTED_RESPONSE);
  }

  updateLocalDb(result);

  const lastMessagesByChatId = buildCollectionByKey(result.messages.map(buildApiMessage), 'chat_id');
  const peersByKey = preparePeers(result);
  const chats: ApiChat[] = [];
  result.dialogs.forEach((dialog) => {
    if (!(dialog instanceof GramJs.Dialog)) {
      return;
    }

    const peerEntity = peersByKey[getPeerKey(dialog.peer)];
    const chat = buildApiChatFromDialog(dialog, peerEntity);
    chat.last_message = lastMessagesByChatId[chat.id];
    chats.push(chat);
  });

  onUpdate({
    '@type': 'chats',
    chats,
  });

  const users = result.users.map(buildApiUser);
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
    store[`chat${chat.id}`] = chat;
  });

  result.users.forEach((user) => {
    store[`user${user.id}`] = user;
  });

  return store;
}

function updateLocalDb(result: GramJs.messages.DialogsSlice) {
  result.users.forEach((user) => {
    localDb.users[user.id] = user;
  });

  result.chats.forEach((chat) => {
    if (chat instanceof GramJs.Chat || chat instanceof GramJs.Channel) {
      localDb.chats[chat.id] = chat;
    }
  });
}

function loadAvatars(result: GramJs.messages.DialogsSlice) {
  result.users.forEach((user) => {
    loadAvatar(user).then((dataUri) => {
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
    loadAvatar(chat).then((dataUri) => {
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
