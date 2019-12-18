import { ApiFile } from './files';

export interface ApiUser {
  id: number;
  type: {
    '@type': 'userTypeBot' | 'userTypeRegular' | 'userTypeDeleted' | 'userTypeUnknown';
  };
  first_name?: string;
  last_name?: string;
  status?: ApiUserStatus;
  username: string;
  phone_number: string;
  access_hash?: string;
  avatar?: {
    hash: string;
  };
  // Obtained from UserFullInfo
  bio?: string;
  // Only in TDLib, remove.
  profile_photo?: {
    small: ApiFile;
    big: ApiFile;
  };
}

export interface ApiUserStatus {
  '@type': (
    'userStatusEmpty' | 'userStatusLastMonth' | 'userStatusLastWeek' |
    'userStatusOffline' | 'userStatusOnline' | 'userStatusRecently'
  );
  was_online?: number;
}
