import { ApiMessage, ApiUser } from '../../types';

export type TdLibUpdateAuthorizationStateType = (
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

export type TdLibUpdateAuthorizationState = {
  '@type': 'updateAuthorizationState';
  authorization_state: {
    '@type': TdLibUpdateAuthorizationStateType;
  };
};

export type TdLibUpdateUser = {
  '@type': 'updateUser';
  user: Pick<ApiUser, 'id'> | Partial<ApiUser> & { id: number };
};

export type TdLibUpdateNewMessage = {
  '@type': 'updateNewMessage';
  message: Pick<ApiMessage, 'id' | 'chat_id'> & Partial<ApiMessage>;
};

export type TdLibAnyUpdate = AnyLiteral & {
  '@type': (
    'updateUserFullInfo' | 'updateUserStatus' |
    'updateNewChat' | 'updateChatLastMessage' | 'updateChatReadInbox' | 'updateChatReadOutbox' | 'updateChatIsPinned' |
    'updateBasicGroup' | 'updateBasicGroupFullInfo' | 'updateSupergroup' | 'updateSupergroupFullInfo' |
    'updateNewMessage' | 'updateMessageSendSucceeded' |
    'updateFile'
  );
};

export type TdLibUpdate = TdLibUpdateAuthorizationState | TdLibUpdateUser | TdLibUpdateNewMessage | TdLibAnyUpdate;
