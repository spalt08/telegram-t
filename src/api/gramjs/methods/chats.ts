import { Api as GramJs } from '../../../lib/gramjs';
import {
  OnApiUpdate, ApiChat, ApiMessage, ApiUser, ApiMessageEntity, ApiFormattedText,
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
import { buildInputEntity, buildInputPeer, buildMtpMessageEntity } from '../gramjsBuilders';

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
    return null;
  }

  updateLocalDb(result);

  const lastMessagesByChatId = buildCollectionByKey(
    result.messages.map(buildApiMessage).filter<ApiMessage>(Boolean as any),
    'chat_id',
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
    chat.last_message = lastMessagesByChatId[chat.id];
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
    chat_ids: chatIds,
    chats,
    users,
    draftsById,
    replyingToById,
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

export async function fetchSuperGroupOnlines(chat: ApiChat) {
  const { id, access_hash } = chat;

  const peer = buildInputPeer(id, access_hash);
  const result = await invokeRequest(new GramJs.messages.GetOnlines({ peer }));

  if (!result) {
    return;
  }

  const { onlines } = result;

  onUpdate({
    '@type': 'updateChat',
    id,
    chat: { online_count: onlines },
  });
}

export async function searchChats({ query, limit }: { query: string; limit?: number }) {
  try {
    const result = await invokeRequest(new GramJs.contacts.Search({ q: query, limit }));
    if (!result) {
      return undefined;
    }

    updateLocalDb(result);

    const localPeerIds = result.myResults.map(getApiChatIdFromMtpPeer);
    const allChats = [...result.chats, ...result.users].map(buildApiChatFromPreview).filter<ApiChat>(Boolean as any);
    const allUsers = result.users.map(buildApiUser).filter((user) => !!user && !user.is_self) as ApiUser[];

    return {
      localChats: allChats.filter((r) => localPeerIds.includes(r.id)),
      localUsers: allUsers.filter((u) => localPeerIds.includes(u.id)),
      globalChats: allChats.filter((r) => !localPeerIds.includes(r.id)),
      globalUsers: allUsers.filter((u) => !localPeerIds.includes(u.id)),
    };
  } catch (err) {
    return undefined;
  }
}

export async function requestChatUpdate(chat: ApiChat) {
  const { id, access_hash } = chat;

  const result = await invokeRequest(new GramJs.messages.GetPeerDialogs({
    peers: [new GramJs.InputDialogPeer({
      peer: buildInputPeer(id, access_hash),
    })],
  }));

  if (!result) {
    return;
  }

  const dialog = result.dialogs[0];
  const lastMessage = buildApiMessage(result.messages[0]);
  if (!dialog || !(dialog instanceof GramJs.Dialog) || !lastMessage) {
    return;
  }

  onUpdate({
    '@type': 'updateChat',
    id,
    chat: {
      last_read_outbox_message_id: dialog.readOutboxMaxId,
      last_read_inbox_message_id: dialog.readInboxMaxId,
      unread_count: dialog.unreadCount,
      unread_mention_count: dialog.unreadMentionsCount,
      last_message: lastMessage,
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
    peer: buildInputPeer(chat.id, chat.access_hash),
    message: text,
    ...(entities && {
      entities: entities.map(buildMtpMessageEntity),
    }),
    replyToMsgId,
  }));
}

export function clearDraft(chat: ApiChat) {
  return invokeRequest(new GramJs.messages.SaveDraft({
    peer: buildInputPeer(chat.id, chat.access_hash),
    message: '',
  }));
}

async function getFullChatInfo(chatId: number) {
  const result = await invokeRequest(new GramJs.messages.GetFullChat({ chatId }));

  if (!result || !(result.fullChat instanceof GramJs.ChatFull)) {
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
    pinned_message_id: pinnedMsgId,
    invite_link: buildChatInviteLink(exportedInvite),
  };
}

async function getFullChannelInfo(channel: GramJs.InputChannel) {
  const result = await invokeRequest(new GramJs.channels.GetFullChannel({ channel }));

  if (!result || !(result.fullChat instanceof GramJs.ChannelFull)) {
    return undefined;
  }

  const {
    about,
    pinnedMsgId,
    exportedInvite,
  } = result.fullChat;

  const invite_link = exportedInvite instanceof GramJs.ChatInviteExported
    ? exportedInvite.link
    : undefined;

  return {
    about,
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

function updateLocalDb(result: GramJs.messages.Dialogs | GramJs.messages.DialogsSlice | GramJs.contacts.Found) {
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
