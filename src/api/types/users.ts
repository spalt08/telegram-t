import { ApiFile } from './files';

export interface ApiUser {
  id: number;
  type: ApiUserType;
  first_name?: string;
  last_name?: string;
  status?: ApiUserStatus;
  username: string;
  phone_number: string;
  access_hash?: string;
  avatar?: {
    hash: string;
  };
  // Obtained from GetFullUser / UserFullInfo
  full_info?: ApiUserFullInfo;

  // Only in TDLib, remove.
  profile_photo?: {
    small: ApiFile;
    big: ApiFile;
  };
}

export interface ApiUserFullInfo {
  bio?: string;
  common_chats_count?: number;
  pinned_message_id?: number;
}

export interface ApiUserType {
  '@type': 'userTypeBot' | 'userTypeRegular' | 'userTypeDeleted' | 'userTypeUnknown';
}

export interface ApiUserStatus {
  '@type': (
    'userStatusEmpty' | 'userStatusLastMonth' | 'userStatusLastWeek' |
    'userStatusOffline' | 'userStatusOnline' | 'userStatusRecently'
  );
  was_online?: number;
}
