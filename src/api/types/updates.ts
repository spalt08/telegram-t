import { ApiChat } from './chats';
import { ApiMessage } from './messages';
import { ApiUser } from './users';

export type ApiUpdateAuthorizationStateType = (
  'authorizationStateLoggingOut' |
  'authorizationStateWaitTdlibParameters' |
  'authorizationStateWaitEncryptionKey' |
  'authorizationStateWaitPhoneNumber' |
  'authorizationStateWaitCode' |
  'authorizationStateWaitPassword' |
  'authorizationStateWaitRegistration' |
  'authorizationStateReady' |
  'authorizationStateClosing' |
  'authorizationStateClosed'
);

export type ApiUpdateAuthorizationState = {
  '@type': 'updateAuthorizationState';
  authorization_state: {
    '@type': ApiUpdateAuthorizationStateType;
  };
  session_id?: string;
};

export type ApiUpdateChats = {
  '@type': 'chats';
  chats: ApiChat[];
};

export type ApiUpdateNewChat = {
  '@type': 'updateNewChat';
  chat: Partial<ApiChat>;
};

export type ApiUpdateChat = {
  '@type': 'updateChat';
  id: number;
  chat: Partial<ApiChat>;
};

export type ApiUpdateNewMessage = {
  '@type': 'updateNewMessage';
  chat_id: number;
  message: Pick<ApiMessage, 'id'> & Partial<ApiMessage>;
};

export type ApiUpdateUsers = {
  '@type': 'users';
  users: ApiUser[];
};

export type ApiUpdateUser = {
  '@type': 'updateUser';
  id: number;
  user: Partial<ApiUser>;
};

export type ApiUpdate = ApiUpdateAuthorizationState |
ApiUpdateChats | ApiUpdateNewChat | ApiUpdateChat |
ApiUpdateNewMessage |
ApiUpdateUsers | ApiUpdateUser;
