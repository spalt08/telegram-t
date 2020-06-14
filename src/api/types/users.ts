export interface ApiUser {
  id: number;
  isSelf: boolean;
  isVerified: boolean;
  isContact: boolean;
  type: ApiUserType;
  firstName?: string;
  lastName?: string;
  status?: ApiUserStatus;
  username: string;
  phoneNumber: string;
  accessHash?: string;
  avatar?: {
    hash: string;
  };
  // Obtained from GetFullUser / UserFullInfo
  fullInfo?: ApiUserFullInfo;
}

export interface ApiUserFullInfo {
  bio?: string;
  commonChatsCount?: number;
  pinnedMessageId?: number;
}

export type ApiUserType = 'userTypeBot' | 'userTypeRegular' | 'userTypeDeleted' | 'userTypeUnknown';

export interface ApiUserStatus {
  type: (
    'userStatusEmpty' | 'userStatusLastMonth' | 'userStatusLastWeek' |
    'userStatusOffline' | 'userStatusOnline' | 'userStatusRecently'
  );
  wasOnline?: number;
  expires?: number;
}
