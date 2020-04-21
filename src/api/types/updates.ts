import {
  ApiChat,
  ApiChatFullInfo,
  ApiTypingStatus,
  ApiChatMember,
} from './chats';
import { ApiMessage, ApiPoll } from './messages';
import { ApiUser, ApiUserFullInfo } from './users';

export type ApiUpdateAuthorizationStateType = (
  'authorizationStateLoggingOut' |
  'authorizationStateWaitPhoneNumber' |
  'authorizationStateWaitCode' |
  'authorizationStateWaitPassword' |
  'authorizationStateWaitRegistration' |
  'authorizationStateReady' |
  'authorizationStateClosing' |
  'authorizationStateClosed'
);

export type ApiUpdateConnectionStateType = (
  'connectionStateConnecting' |
  'connectionStateReady'
);

export type ApiUpdateAuthorizationState = {
  '@type': 'updateAuthorizationState';
  authorizationState: ApiUpdateAuthorizationStateType;
  sessionId?: string;
};

export type ApiUpdateAuthorizationError = {
  '@type': 'updateAuthorizationError';
  message: string;
};

export type ApiUpdateConnectionState = {
  '@type': 'updateConnectionState';
  connectionState: ApiUpdateConnectionStateType;
};

export type ApiUpdateCurrentUserId = {
  '@type': 'updateCurrentUserId';
  currentUserId: number;
};

export type ApiUpdateChat = {
  '@type': 'updateChat';
  id: number;
  chat: Partial<ApiChat>;
};

export type ApiUpdateChatJoin = {
  '@type': 'updateChatJoin';
  id: number;
};

export type ApiUpdateChatLeave = {
  '@type': 'updateChatLeave';
  id: number;
};

export type ApiUpdateChatInbox = {
  '@type': 'updateChatInbox';
  id: number;
  chat: Partial<ApiChat>;
};

export type ApiUpdateChatTypingStatus = {
  '@type': 'updateChatTypingStatus';
  id: number;
  typingStatus: ApiTypingStatus | undefined;
};

export type ApiUpdateChatFullInfo = {
  '@type': 'updateChatFullInfo';
  id: number;
  fullInfo: Partial<ApiChatFullInfo>;
};

export type ApiUpdateChatMembers = {
  '@type': 'updateChatMembers';
  id: number;
  replacedMembers?: ApiChatMember[];
  addedMember?: ApiChatMember;
  deletedMemberId?: number;
};

export type ApiUpdatePinnedChatIds = {
  '@type': 'updatePinnedChatIds';
  ids: number[];
};

export type ApiUpdateNewMessage = {
  '@type': 'newMessage';
  chatId: number;
  id: number;
  message: Partial<ApiMessage>;
};

export type ApiUpdateMessage= {
  '@type': 'updateMessage';
  chatId: number;
  id: number;
  message: Partial<ApiMessage>;
};

export type ApiUpdateMessageSendSucceeded = {
  '@type': 'updateMessageSendSucceeded';
  chatId: number;
  localId: number;
  message: ApiMessage;
};

export type ApiUpdateMessageSendFailed = {
  '@type': 'updateMessageSendFailed';
  chatId: number;
  localId: number;
  sendingState: {
    '@type': 'messageSendingStateFailed';
  };
};

export type ApiUpdateCommonBoxMessages = {
  '@type': 'updateCommonBoxMessages';
  ids: number[];
  messageUpdate: Partial<ApiMessage>;
};

export type ApiUpdateChannelMessages = {
  '@type': 'updateChannelMessages';
  channelId: number;
  ids: number[];
  messageUpdate: Partial<ApiMessage>;
};

export type ApiUpdateMessagePoll = {
  '@type': 'updateMessagePoll';
  pollId: string;
  pollUpdate: Partial<ApiPoll>;
};

export type ApiUpdateMessagePollVote = {
  '@type': 'updateMessagePollVote';
  pollId: string;
  userId: number;
  options: string[];
};

export type ApiUpdateDeleteMessages = {
  '@type': 'deleteMessages';
  ids: number[];
  chatId?: number;
};

export type ApiUpdateUser = {
  '@type': 'updateUser';
  id: number;
  user: Partial<ApiUser>;
};

export type ApiUpdateUserFullInfo = {
  '@type': 'updateUserFullInfo';
  id: number;
  fullInfo: Partial<ApiUserFullInfo>;
};

export type ApiUpdateAvatar = {
  '@type': 'updateAvatar';
  chatId: number;
  dataUri: string;
};

export type ApiUpdateMessageImage = {
  '@type': 'updateMessageImage';
  messageId: number;
  dataUri: string;
};

export type ApiError = {
  message: string;
};

export type ApiUpdateError = {
  '@type': 'error';
  error: ApiError;
};

export type ApiUpdateResetContacts = {
  '@type': 'updateResetContactList';
};

export type ApiUpdate = (
  ApiUpdateAuthorizationState | ApiUpdateAuthorizationError | ApiUpdateConnectionState | ApiUpdateCurrentUserId |
  ApiUpdateChat | ApiUpdateChatInbox | ApiUpdateChatTypingStatus | ApiUpdateChatFullInfo | ApiUpdatePinnedChatIds |
  ApiUpdateChatMembers | ApiUpdateChatJoin | ApiUpdateChatLeave |
  ApiUpdateNewMessage | ApiUpdateMessage| ApiUpdateCommonBoxMessages | ApiUpdateChannelMessages |
  ApiUpdateDeleteMessages | ApiUpdateMessagePoll | ApiUpdateMessagePollVote |
  ApiUpdateMessageSendSucceeded | ApiUpdateMessageSendFailed |
  ApiUpdateUser | ApiUpdateUserFullInfo |
  ApiUpdateAvatar | ApiUpdateMessageImage |
  ApiUpdateError | ApiUpdateResetContacts
);

export type OnApiUpdate = (update: ApiUpdate) => void;
