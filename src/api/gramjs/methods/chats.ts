import { Api as GramJs } from '../../../lib/gramjs';
import {
  OnApiUpdate, ApiChat, ApiMessage, ApiUser, ApiMessageEntity, ApiFormattedText, ApiChatFullInfo,
} from '../../types';

import { invokeRequest } from './client';
import {
  buildApiChatFromDialog,
  getPeerKey,
  buildChatMembers,
  buildChatInviteLink,
  buildApiChatFromPreview,
  getApiChatIdFromMtpPeer,
} from '../apiBuilders/chats';
import { buildApiMessage, buildMessageDraft } from '../apiBuilders/messages';
import { buildApiUser } from '../apiBuilders/users';
import { buildCollectionByKey } from '../../../util/iteratees';
import localDb from '../localDb';
import {
  buildInputEntity, buildInputPeer, buildMtpMessageEntity, getEntityTypeById,
} from '../gramjsBuilders';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchChats({
  limit,
  offsetDate,
}: {
  limit: number;
  offsetDate?: number;
}) {
  const result = await invokeRequest(new GramJs.messages.GetDialogs({
    offsetPeer: new GramJs.InputPeerEmpty(),
    limit,
    offsetDate,
  }));

  if (!result || result instanceof GramJs.messages.DialogsNotModified) {
    return undefined;
  }

  updateLocalDb(result);

  const lastMessagesByChatId = buildCollectionByKey(
    result.messages.map(buildApiMessage).filter<ApiMessage>(Boolean as any),
    'chatId',
  );
  const peersByKey = preparePeers(result);
  const chats: ApiChat[] = [];
  const draftsById: Record<number, ApiFormattedText> = {};
  const replyingToById: Record<number, number> = {};

  result.dialogs.forEach((dialog) => {
    if (!(dialog instanceof GramJs.Dialog)) {
      return;
    }

    const peerEntity = peersByKey[getPeerKey(dialog.peer)];
    const chat = buildApiChatFromDialog(dialog, peerEntity);
    chat.lastMessage = lastMessagesByChatId[chat.id];
    chats.push(chat);

    if (dialog.draft) {
      const { formattedText, replyingToId } = buildMessageDraft(dialog.draft) || {};
      if (formattedText) {
        draftsById[chat.id] = formattedText;
      }
      if (replyingToId) {
        replyingToById[chat.id] = replyingToId;
      }
    }
  });

  const users = result.users.map(buildApiUser).filter<ApiUser>(Boolean as any);
  const chatIds = chats.map((chat) => chat.id);

  return {
    chatIds,
    chats,
    users,
    draftsById,
    replyingToById,
  };
}

export function fetchFullChat(chat: ApiChat) {
  const { id, accessHash } = chat;
  const input = buildInputEntity(id, accessHash);

  return input instanceof GramJs.InputChannel
    ? getFullChannelInfo(input)
    : getFullChatInfo(input as number);
}

export async function fetchSuperGroupOnlines(chat: ApiChat) {
  const { id, accessHash } = chat;

  const peer = buildInputPeer(id, accessHash);
  const result = await invokeRequest(new GramJs.messages.GetOnlines({ peer }));

  if (!result) {
    return;
  }

  const { onlines } = result;

  onUpdate({
    '@type': 'updateChat',
    id,
    chat: { onlineCount: onlines },
  });
}

export async function searchChats({ query, limit }: { query: string; limit?: number }) {
  const result = await invokeRequest(new GramJs.contacts.Search({ q: query, limit }));
  if (!result) {
    return undefined;
  }

  updateLocalDb(result);

  const localPeerIds = result.myResults.map(getApiChatIdFromMtpPeer);
  const allChats = [...result.chats, ...result.users]
    .map((user) => buildApiChatFromPreview(user))
    .filter<ApiChat>(Boolean as any);
  const allUsers = result.users.map(buildApiUser).filter((user) => !!user && !user.isSelf) as ApiUser[];

  return {
    localChats: allChats.filter((r) => localPeerIds.includes(r.id)),
    localUsers: allUsers.filter((u) => localPeerIds.includes(u.id)),
    globalChats: allChats.filter((r) => !localPeerIds.includes(r.id)),
    globalUsers: allUsers.filter((u) => !localPeerIds.includes(u.id)),
  };
}

export async function fetchSupportChat() {
  const result = await invokeRequest(new GramJs.help.GetSupport());

  if (!result) {
    return;
  }

  const { user } = result;
  if (user instanceof GramJs.User) {
    localDb.users[user.id] = user;
  }

  const chat = buildApiChatFromPreview(user);
  if (!chat) {
    return;
  }

  onUpdate({
    '@type': 'updateChat',
    id: chat.id,
    chat,
  });
}

export async function fetchChatWithSelf() {
  const result = await invokeRequest(new GramJs.users.GetUsers({
    id: [new GramJs.InputUserSelf()],
  }));

  if (!result || !result.length) {
    return;
  }

  const user = result[0];
  if (user instanceof GramJs.User) {
    localDb.users[user.id] = user;
  }

  const chat = buildApiChatFromPreview(user);
  if (!chat) {
    return;
  }

  onUpdate({
    '@type': 'updateChat',
    id: chat.id,
    chat,
  });
}

export async function requestChatUpdate(chat: ApiChat) {
  const { id, accessHash } = chat;

  const result = await invokeRequest(new GramJs.messages.GetPeerDialogs({
    peers: [new GramJs.InputDialogPeer({
      peer: buildInputPeer(id, accessHash),
    })],
  }));

  if (!result) {
    return;
  }

  const dialog = result.dialogs[0];
  const updatedChat = result.chats[0];
  const lastMessage = buildApiMessage(result.messages[0]);
  if (!dialog || !(dialog instanceof GramJs.Dialog) || !updatedChat) {
    return;
  }

  onUpdate({
    '@type': 'updateChat',
    id,
    chat: {
      ...buildApiChatFromDialog(dialog, updatedChat),
      lastMessage,
    },
  });
}

export function saveDraft({
  chat,
  text,
  entities,
  replyToMsgId,
}: {
  chat: ApiChat;
  text: string;
  entities?: ApiMessageEntity[];
  replyToMsgId?: number;
}) {
  return invokeRequest(new GramJs.messages.SaveDraft({
    peer: buildInputPeer(chat.id, chat.accessHash),
    message: text,
    ...(entities && {
      entities: entities.map(buildMtpMessageEntity),
    }),
    replyToMsgId,
  }));
}

export function clearDraft(chat: ApiChat) {
  return invokeRequest(new GramJs.messages.SaveDraft({
    peer: buildInputPeer(chat.id, chat.accessHash),
    message: '',
  }));
}

async function getFullChatInfo(chatId: number): Promise<{
  fullInfo: ApiChatFullInfo;
  users: ApiUser[];
} | undefined> {
  const result = await invokeRequest(new GramJs.messages.GetFullChat({ chatId }));

  if (!result || !(result.fullChat instanceof GramJs.ChatFull)) {
    return undefined;
  }

  updateLocalDb(result);

  const {
    about,
    participants,
    pinnedMsgId,
    exportedInvite,
  } = result.fullChat;

  const members = buildChatMembers(participants);

  return {
    fullInfo: {
      about,
      members,
      pinnedMessageId: pinnedMsgId,
      inviteLink: buildChatInviteLink(exportedInvite),
    },
    users: result.users.map(buildApiUser).filter<ApiUser>(Boolean as any),
  };
}

async function getFullChannelInfo(channel: GramJs.InputChannel): Promise<{
  fullInfo: ApiChatFullInfo;
  users: ApiUser[];
} | undefined> {
  const result = await invokeRequest(new GramJs.channels.GetFullChannel({ channel }));

  if (!result || !(result.fullChat instanceof GramJs.ChannelFull)) {
    return undefined;
  }

  const {
    about,
    pinnedMsgId,
    exportedInvite,
    slowmodeSeconds,
    slowmodeNextSendDate,
    migratedFromChatId,
    migratedFromMaxId,
  } = result.fullChat;

  const inviteLink = exportedInvite instanceof GramJs.ChatInviteExported
    ? exportedInvite.link
    : undefined;

  return {
    fullInfo: {
      about,
      pinnedMessageId: pinnedMsgId,
      inviteLink,
      slowMode: slowmodeSeconds ? {
        seconds: slowmodeSeconds,
        nextSendDate: slowmodeNextSendDate,
      } : undefined,
      migratedFrom: migratedFromChatId ? {
        chatId: getApiChatIdFromMtpPeer({ chatId: migratedFromChatId } as GramJs.TypePeer),
        maxMessageId: migratedFromMaxId,
      } : undefined,
    },
    users: [],
  };
}

export async function markChatRead({
  chat, maxId,
}: {
  chat: ApiChat; maxId?: number;
}) {
  const isChannel = getEntityTypeById(chat.id) === 'channel';

  await invokeRequest(
    isChannel
      ? new GramJs.channels.ReadHistory({
        channel: buildInputEntity(chat.id, chat.accessHash) as GramJs.InputChannel,
        maxId,
      })
      : new GramJs.messages.ReadHistory({
        peer: buildInputPeer(chat.id, chat.accessHash),
        maxId,
      }),
  );

  void requestChatUpdate(chat);
}

function preparePeers(result: GramJs.messages.Dialogs | GramJs.messages.DialogsSlice) {
  const store: Record<string, GramJs.TypeChat | GramJs.TypeUser> = {};

  result.chats.forEach((chat) => {
    store[`chat${chat.id}`] = chat;
  });

  result.users.forEach((user) => {
    store[`user${user.id}`] = user;
  });

  return store;
}

function updateLocalDb(result: (
  GramJs.messages.Dialogs | GramJs.messages.DialogsSlice |
  GramJs.contacts.Found | GramJs.messages.ChatFull
)) {
  result.users.forEach((user) => {
    if (user instanceof GramJs.User) {
      localDb.users[user.id] = user;
    }
  });

  result.chats.forEach((chat) => {
    if (chat instanceof GramJs.Chat || chat instanceof GramJs.Channel) {
      localDb.chats[chat.id] = chat;
    }
  });
}
