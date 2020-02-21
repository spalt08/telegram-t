import { ApiChat, ApiChatFullInfo } from './chats';
import { ApiMessage } from './messages';
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

export type ApiUpdateMessages = {
  '@type': 'updateMessages';
  ids: number[];
  messageUpdate: Partial<ApiMessage>;
};

export type ApiUpdateDeleteMessages = {
  '@type': 'deleteMessages';
  ids: number[];
  chat_id?: number;
};

export type ApiUpdateFileUploadProgress = {
  '@type': 'updateFileUploadProgress';
  chat_id: number;
  message_id: number;
  progress: number;
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

export type ApiUpdate = (
  ApiUpdateAuthorizationState | ApiUpdateAuthorizationError | ApiUpdateConnectionState | ApiUpdateCurrentUserId |
  ApiUpdateChat | ApiUpdateChatFullInfo | ApiUpdatePinnedChatIds |
  ApiUpdateNewMessage | ApiUpdateEditMessage | ApiUpdateMessages | ApiUpdateDeleteMessages |
  ApiUpdateMessageSendSucceeded | ApiUpdateMessageSendFailed |
  ApiUpdateFileUploadProgress |
  ApiUpdateUser | ApiUpdateUserFullInfo |
  ApiUpdateAvatar | ApiUpdateMessageImage
);

export type OnApiUpdate = (update: ApiUpdate) => void;
