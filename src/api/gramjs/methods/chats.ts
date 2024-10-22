import { Api as GramJs } from '../../../lib/gramjs';
import {
  OnApiUpdate,
  ApiChat,
  ApiMessage,
  ApiUser,
  ApiMessageEntity,
  ApiFormattedText,
  ApiChatFullInfo,
  ApiChatFolder,
} from '../../types';

import { DEBUG, ARCHIVED_FOLDER_ID } from '../../../config';
import { invokeRequest, uploadFile } from './client';
import {
  buildApiChatFromDialog,
  getPeerKey,
  buildChatMembers,
  buildChatInviteLink,
  buildApiChatFromPreview,
  getApiChatIdFromMtpPeer,
  buildApiChatFolder,
  buildApiChatFolderFromSuggested,
} from '../apiBuilders/chats';
import { buildApiMessage, buildMessageDraft } from '../apiBuilders/messages';
import { buildApiUser } from '../apiBuilders/users';
import { buildCollectionByKey } from '../../../util/iteratees';
import localDb from '../localDb';
import {
  buildInputEntity,
  buildInputPeer,
  buildMtpMessageEntity,
  getEntityTypeById,
  buildFilterFromApiFolder,
} from '../gramjsBuilders';

const MAX_INT_32 = 2 ** 31 - 1;

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchChats({
  limit,
  offsetDate,
  archived,
  withPinned,
}: {
  limit: number;
  offsetDate?: number;
  archived?: boolean;
  withPinned?: boolean;
}) {
  const result = await invokeRequest(new GramJs.messages.GetDialogs({
    offsetPeer: new GramJs.InputPeerEmpty(),
    limit,
    offsetDate,
    folderId: archived ? ARCHIVED_FOLDER_ID : undefined,
    ...(withPinned && { excludePinned: true }),
  }));
  const resultPinned = withPinned
    ? await invokeRequest(new GramJs.messages.GetPinnedDialogs({
      folderId: archived ? ARCHIVED_FOLDER_ID : undefined,
    }))
    : undefined;

  if (!result || result instanceof GramJs.messages.DialogsNotModified) {
    return undefined;
  }

  updateLocalDb(result);
  if (resultPinned) {
    updateLocalDb(resultPinned);
  }

  const lastMessagesByChatId = buildCollectionByKey(
    [...result.messages, ...(resultPinned ? resultPinned.messages : [])]
      .map(buildApiMessage)
      .filter<ApiMessage>(Boolean as any),
    'chatId',
  );
  const peersByKey: Record<string, GramJs.TypeChat | GramJs.TypeUser> = {
    ...preparePeers(result),
    ...(resultPinned && preparePeers(resultPinned)),
  };
  const chats: ApiChat[] = [];
  const draftsById: Record<number, ApiFormattedText> = {};
  const replyingToById: Record<number, number> = {};

  const dialogs = [
    ...(resultPinned ? resultPinned.dialogs : []),
    ...result.dialogs,
  ];

  const orderedPinnedIds: number[] = [];

  dialogs.forEach((dialog) => {
    if (
      !(dialog instanceof GramJs.Dialog)
      // This request can return dialogs not belonging to specified folder
      || (!archived && dialog.folderId === ARCHIVED_FOLDER_ID)
      || (archived && dialog.folderId !== ARCHIVED_FOLDER_ID)
    ) {
      return;
    }

    const peerEntity = peersByKey[getPeerKey(dialog.peer)];
    const chat = buildApiChatFromDialog(dialog, peerEntity);
    chat.lastMessage = lastMessagesByChatId[chat.id];
    chats.push(chat);

    if (withPinned && dialog.pinned) {
      orderedPinnedIds.push(chat.id);
    }

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

  const users = [...result.users, ...(resultPinned ? resultPinned.users : [])]
    .map(buildApiUser)
    .filter<ApiUser>(Boolean as any);
  const chatIds = chats.map((chat) => chat.id);

  let totalChatCount: number;

  if (result instanceof GramJs.messages.DialogsSlice) {
    totalChatCount = result.count;
  } else {
    totalChatCount = chatIds.length;
  }

  return {
    chatIds,
    chats,
    users,
    draftsById,
    replyingToById,
    orderedPinnedIds: withPinned ? orderedPinnedIds : undefined,
    totalChatCount,
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

export async function fetchChat({
  type, user,
}: {
  type: 'user' | 'self' | 'support'; user?: ApiUser;
}) {
  let mtpUser: GramJs.User | undefined;

  if (type === 'self' || type === 'user') {
    const result = await invokeRequest(new GramJs.users.GetUsers({
      id: [
        type === 'user' && user
          ? buildInputEntity(user.id, user.accessHash) as GramJs.InputUser
          : new GramJs.InputUserSelf(),
      ],
    }));
    if (!result || !result.length) {
      return undefined;
    }

    [mtpUser] = result;
  } else if (type === 'support') {
    const result = await invokeRequest(new GramJs.help.GetSupport());
    if (!result || !result.user) {
      return undefined;
    }

    mtpUser = result.user;
  }

  const chat = buildApiChatFromPreview(mtpUser!, undefined, type === 'support');
  if (!chat) {
    return undefined;
  }

  onUpdate({
    '@type': 'updateChat',
    id: chat.id,
    chat,
  });

  return { chatId: chat.id };
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
  if (!dialog || !(dialog instanceof GramJs.Dialog)) {
    return;
  }

  const peersByKey = preparePeers(result);
  const peerEntity = peersByKey[getPeerKey(dialog.peer)];
  if (!peerEntity) {
    return;
  }

  const lastMessage = buildApiMessage(result.messages[0]);

  onUpdate({
    '@type': 'updateChat',
    id,
    chat: {
      ...buildApiChatFromDialog(dialog, peerEntity),
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

export async function updateChatMutedState({
  chat, isMuted,
}: {
  chat: ApiChat; isMuted: boolean;
}) {
  await invokeRequest(new GramJs.account.UpdateNotifySettings({
    peer: new GramJs.InputNotifyPeer({
      peer: buildInputPeer(chat.id, chat.accessHash),
    }),
    settings: new GramJs.InputPeerNotifySettings({ muteUntil: isMuted ? MAX_INT_32 : undefined }),
  }));

  void requestChatUpdate(chat);
}

export async function createChannel({
  title, about,
}: {
  title: string; about?: string;
}): Promise<ApiChat | undefined> {
  const result = await invokeRequest(new GramJs.channels.CreateChannel({
    broadcast: true,
    title,
    about,
  }), true);

  // `createChannel` can return a lot of different update types according to docs,
  // but currently channel creation returns only `Updates` type.
  // Errors are added to catch unexpected cases in future testing
  if (!(result instanceof GramJs.Updates)) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Unexpected channel creation update', result);
    }
    return undefined;
  }

  const newChannel = result.chats[0];
  if (!newChannel || !(newChannel instanceof GramJs.Channel)) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Created channel not found', result);
    }
    return undefined;
  }

  return buildApiChatFromPreview(newChannel);
}

export async function editChannelPhoto({
  channelId, accessHash, photo,
}: {
  channelId: number; accessHash: string; photo: File;
}) {
  const uploadedPhoto = await uploadFile(photo);
  return invokeRequest(new GramJs.channels.EditPhoto({
    channel: buildInputEntity(channelId, accessHash) as GramJs.InputChannel,
    photo: new GramJs.InputChatUploadedPhoto({
      file: uploadedPhoto,
    }),
  }), true);
}

export function joinChannel({
  channelId, accessHash,
}: {
  channelId: number; accessHash: string;
}) {
  return invokeRequest(new GramJs.channels.JoinChannel({
    channel: buildInputEntity(channelId, accessHash) as GramJs.InputChannel,
  }), true);
}

export function leaveChannel({
  channelId, accessHash,
}: {
  channelId: number; accessHash: string;
}) {
  return invokeRequest(new GramJs.channels.LeaveChannel({
    channel: buildInputEntity(channelId, accessHash) as GramJs.InputChannel,
  }), true);
}

export function deleteChannel({
  channelId, accessHash,
}: {
  channelId: number; accessHash: string;
}) {
  return invokeRequest(new GramJs.channels.DeleteChannel({
    channel: buildInputEntity(channelId, accessHash) as GramJs.InputChannel,
  }), true);
}

export async function createGroupChat({
  title, users,
}: {
  title: string; users: ApiUser[];
}): Promise<ApiChat | undefined> {
  const result = await invokeRequest(new GramJs.messages.CreateChat({
    title,
    users: users.map(({ id, accessHash }) => buildInputEntity(id, accessHash)) as GramJs.InputUser[],
  }), true);

  // `createChat` can return a lot of different update types according to docs,
  // but currently chat creation returns only `Updates` type.
  // Errors are added to catch unexpected cases in future testing
  if (!(result instanceof GramJs.Updates)) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Unexpected chat creation update', result);
    }
    return undefined;
  }

  const newChat = result.chats[0];
  if (!newChat || !(newChat instanceof GramJs.Chat)) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Created chat not found', result);
    }
    return undefined;
  }

  return buildApiChatFromPreview(newChat);
}

export async function editChatPhoto({
  chatId, photo,
}: {
  chatId: number; photo: File;
}) {
  const uploadedPhoto = await uploadFile(photo);
  return invokeRequest(new GramJs.messages.EditChatPhoto({
    chatId: buildInputEntity(chatId) as number,
    photo: new GramJs.InputChatUploadedPhoto({
      file: uploadedPhoto,
    }),
  }), true);
}

export async function toggleChatPinned({
  chat,
  shouldBePinned,
}: {
  chat: ApiChat;
  shouldBePinned: boolean;
}) {
  const { id, accessHash } = chat;

  const isActionSuccessful = await invokeRequest(new GramJs.messages.ToggleDialogPin({
    peer: new GramJs.InputDialogPeer({
      peer: buildInputPeer(id, accessHash),
    }),
    pinned: shouldBePinned || undefined,
  }));

  if (isActionSuccessful) {
    onUpdate({
      '@type': 'updateChatPinned',
      id: chat.id,
      isPinned: shouldBePinned,
    });
  }
}

export function toggleChatArchived({
  chat, folderId,
}: {
  chat: ApiChat; folderId: number;
}) {
  const { id, accessHash } = chat;

  return invokeRequest(new GramJs.folders.EditPeerFolders({
    folderPeers: [new GramJs.InputFolderPeer({
      peer: buildInputPeer(id, accessHash),
      folderId,
    })],
  }), true);
}

export async function fetchChatFolders() {
  const result = await invokeRequest(new GramJs.messages.GetDialogFilters());

  if (!result) {
    return undefined;
  }

  return {
    byId: buildCollectionByKey(result.map(buildApiChatFolder), 'id') as Record<number, ApiChatFolder>,
    orderedIds: result.map(({ id }) => id),
  };
}

export async function fetchRecommendedChatFolders() {
  const results = await invokeRequest(new GramJs.messages.GetSuggestedDialogFilters());

  if (!results) {
    return undefined;
  }

  return results.map(buildApiChatFolderFromSuggested);
}

export async function editChatFolder({
  id,
  folderUpdate,
}: {
  id: number;
  folderUpdate: ApiChatFolder;
}) {
  const filter = buildFilterFromApiFolder(folderUpdate);

  const isActionSuccessful = await invokeRequest(new GramJs.messages.UpdateDialogFilter({
    id,
    filter,
  }));

  if (isActionSuccessful) {
    onUpdate({
      '@type': 'updateChatFolder',
      id,
      folder: folderUpdate,
    });
  }
}

export async function deleteChatFolder(id: number) {
  const isActionSuccessful = await invokeRequest(new GramJs.messages.UpdateDialogFilter({
    id,
    filter: undefined,
  }));
  const recommendedChatFolders = await fetchRecommendedChatFolders();

  if (isActionSuccessful) {
    onUpdate({
      '@type': 'updateChatFolder',
      id,
      folder: undefined,
    });
  }
  if (recommendedChatFolders) {
    onUpdate({
      '@type': 'updateRecommendedChatFolders',
      folders: recommendedChatFolders,
    });
  }
}

export async function toggleDialogUnread({
  chat, hasUnreadMark,
}: {
  chat: ApiChat; hasUnreadMark: boolean | undefined;
}) {
  const { id, accessHash } = chat;

  const isActionSuccessful = await invokeRequest(new GramJs.messages.MarkDialogUnread({
    peer: new GramJs.InputDialogPeer({
      peer: buildInputPeer(id, accessHash),
    }),
    unread: hasUnreadMark || undefined,
  }));

  if (isActionSuccessful) {
    onUpdate({
      '@type': 'updateChat',
      id: chat.id,
      chat: { hasUnreadMark },
    });
  }
}

function preparePeers(
  result: GramJs.messages.Dialogs | GramJs.messages.DialogsSlice | GramJs.messages.PeerDialogs,
) {
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
  GramJs.contacts.Found | GramJs.messages.ChatFull | GramJs.messages.PeerDialogs
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
