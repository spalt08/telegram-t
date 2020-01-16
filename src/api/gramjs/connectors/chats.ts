import { Api as GramJs } from '../../../lib/gramjs';
import { OnApiUpdate, ApiChat } from '../../types';

import { invokeRequest } from '../client';
import {
  buildApiChatFromDialog,
  getPeerKey,
  buildChatMembers,
  buildChatInviteLink,
} from '../builders/chats';
import { buildApiMessage } from '../builders/messages';
import { buildApiUser } from '../builders/users';
import { buildCollectionByKey } from '../../../util/iteratees';
import localDb from '../localDb';
import { buildInputEntity, buildInputPeer } from '../inputHelpers';

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
) {
  const result = await invokeRequest(new GramJs.messages.GetDialogs({
    offsetPeer: new GramJs.InputPeerEmpty({}),
    limit,
    offsetDate,
  }));

  if (result instanceof GramJs.messages.DialogsNotModified) {
    return null;
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

  const users = result.users.map(buildApiUser);
  const chatIds = chats.map((chat) => chat.id);

  return {
    chat_ids: chatIds,
    chats,
    users,
  };
}

export async function fetchFullChat(chat: ApiChat) {
  const { id, access_hash } = chat;
  const input = buildInputEntity(id, access_hash);

  const full_info = input instanceof GramJs.InputChannel
    ? await getFullChannelInfo(input)
    : await getFullChatInfo(input as number);

  onUpdate({
    '@type': 'updateChat',
    id,
    chat: { full_info },
  });
}

export async function fetchChatOnlines(chat: ApiChat) {
  const { id, access_hash } = chat;
  const peer = buildInputPeer(id, access_hash);

  const result = await invokeRequest(new GramJs.messages.GetOnlines({ peer }));
  const { onlines } = result;

  onUpdate({
    '@type': 'updateChat',
    id,
    chat: { online_count: onlines },
  });
}

async function getFullChatInfo(chatId: number) {
  const result = await invokeRequest(new GramJs.messages.GetFullChat({ chatId }));

  if (!(result.fullChat instanceof GramJs.ChatFull)) {
    return undefined;
  }

  const {
    about,
    participants,
    pinnedMsgId,
    exportedInvite,
  } = result.fullChat;

  const members = buildChatMembers(participants);

  return {
    about,
    members,
    member_count: members && members.length,
    pinned_message_id: pinnedMsgId,
    invite_link: buildChatInviteLink(exportedInvite),
  };
}

async function getFullChannelInfo(channel: GramJs.InputChannel) {
  const result = await invokeRequest(new GramJs.channels.GetFullChannel({ channel }));

  if (!(result.fullChat instanceof GramJs.ChannelFull)) {
    return undefined;
  }

  const {
    about,
    participantsCount,
    pinnedMsgId,
    exportedInvite,
  } = result.fullChat;

  const invite_link = exportedInvite instanceof GramJs.ChatInviteExported
    ? exportedInvite.link
    : undefined;

  return {
    about,
    member_count: participantsCount,
    pinned_message_id: pinnedMsgId,
    invite_link,
  };
}

function preparePeers(result: GramJs.messages.Dialogs | GramJs.messages.DialogsSlice) {
  const store: Record<string, GramJs.Chat | GramJs.User> = {};

  result.chats.forEach((chat) => {
    store[`chat${chat.id}`] = chat;
  });

  result.users.forEach((user) => {
    store[`user${user.id}`] = user;
  });

  return store;
}

function updateLocalDb(result: GramJs.messages.Dialogs | GramJs.messages.DialogsSlice) {
  result.users.forEach((user) => {
    localDb.users[user.id] = user;
  });

  result.chats.forEach((chat) => {
    if (chat instanceof GramJs.Chat || chat instanceof GramJs.Channel) {
      localDb.chats[chat.id] = chat;
    }
  });
}
