import { ApiChat, ApiChatFullInfo, ApiTypingStatus } from './chats';
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
  authorization_state: {
    '@type': ApiUpdateAuthorizationStateType;
  };
  session_id?: string;
};

export type ApiUpdateAuthorizationError = {
  '@type': 'updateAuthorizationError';
  message: string;
};

export type ApiUpdateConnectionState = {
  '@type': 'updateConnectionState';
  connection_state: {
    '@type': ApiUpdateConnectionStateType;
  };
};

export type ApiUpdateCurrentUserId = {
  '@type': 'updateCurrentUserId';
  current_user_id: number;
};

export type ApiUpdateChat = {
  '@type': 'updateChat';
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
  full_info: Partial<ApiChatFullInfo>;
};

export type ApiUpdatePinnedChatIds = {
  '@type': 'updatePinnedChatIds';
  ids: number[];
};

export type ApiUpdateNewMessage = {
  '@type': 'newMessage';
  chat_id: number;
  id: number;
  message: Partial<ApiMessage>;
};

export type ApiUpdateEditMessage = {
  '@type': 'editMessage';
  chat_id: number;
  id: number;
  message: Partial<ApiMessage>;
};

export type ApiUpdateMessageSendSucceeded = {
  '@type': 'updateMessageSendSucceeded';
  chat_id: number;
  local_id: number;
  message: ApiMessage;
};

export type ApiUpdateMessageSendFailed = {
  '@type': 'updateMessageSendFailed';
  chat_id: number;
  local_id: number;
  sending_state: {
    '@type': 'messageSendingStateFailed';
  };
};

export type ApiUpdateCommonBoxMessages = {
  '@type': 'updateCommonBoxMessages';
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
  chat_id?: number;
};

export type ApiUpdateUser = {
  '@type': 'updateUser';
  id: number;
  user: Partial<ApiUser>;
};

export type ApiUpdateUserFullInfo = {
  '@type': 'updateUserFullInfo';
  id: number;
  full_info: Partial<ApiUserFullInfo>;
};

export type ApiUpdateAvatar = {
  '@type': 'updateAvatar';
  chat_id: number;
  data_uri: string;
};

export type ApiUpdateMessageImage = {
  '@type': 'updateMessageImage';
  message_id: number;
  data_uri: string;
};

export type ApiError = {
  message: string;
};

export type ApiUpdateError = {
  '@type': 'error';
  error: ApiError;
};

export type ApiUpdate = (
  ApiUpdateAuthorizationState | ApiUpdateAuthorizationError | ApiUpdateConnectionState | ApiUpdateCurrentUserId |
  ApiUpdateChat | ApiUpdateChatTypingStatus | ApiUpdateChatFullInfo | ApiUpdatePinnedChatIds |
  ApiUpdateNewMessage | ApiUpdateEditMessage | ApiUpdateCommonBoxMessages | ApiUpdateDeleteMessages |
  ApiUpdateMessagePoll | ApiUpdateMessagePollVote |
  ApiUpdateMessageSendSucceeded | ApiUpdateMessageSendFailed |
  ApiUpdateUser | ApiUpdateUserFullInfo |
  ApiUpdateAvatar | ApiUpdateMessageImage |
  ApiUpdateError
);

export type OnApiUpdate = (update: ApiUpdate) => void;
