type UpdateAuthorizationStateType = (
  'authorizationStateLoggingOut' |
  'authorizationStateWaitTdlibParameters' |
  'authorizationStateWaitEncryptionKey' |
  'authorizationStateWaitPhoneNumber' |
  'authorizationStateWaitCode' |
  'authorizationStateWaitPassword' |
  'authorizationStateReady' |
  'authorizationStateClosing' |
  'authorizationStateClosed'
  )

export type TdLibUpdateAuthorizationState = {
  '@type': 'updateAuthorizationState',
  authorization_state: {
    '@type': UpdateAuthorizationStateType
  }
};

export type TdLibUpdateFile = {
  '@type': 'updateFile',
};

export type TdLibUpdate = TdLibUpdateAuthorizationState | TdLibUpdateFile;
