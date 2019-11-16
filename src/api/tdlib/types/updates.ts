export type UpdateAuthorizationStateType = (
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
    '@type': UpdateAuthorizationStateType;
  };
  sessionId?: string;
};

export type TdLibUpdateFile = {
  '@type': 'updateFile';
};

export type TdLibUpdateNewChat = {
  '@type': 'updateNewChat';
  chat: {
    '@type': 'chat';
    [k: string]: any;
  };
};

export type TdLibUpdate = TdLibUpdateAuthorizationState | TdLibUpdateFile | TdLibUpdateNewChat | any;
