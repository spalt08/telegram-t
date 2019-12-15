import { ApiFile } from './files';

export interface ApiUser {
  id: number;
  type: {
    '@type': 'userTypeBot' | 'userTypeRegular' | 'userTypeDeleted' | 'userTypeUnknown';
  };
  first_name?: string;
  last_name?: string;
  status?: ApiUserStatus;
  // Only in TDLib, remove.
  profile_photo?: {
    small: ApiFile;
    big: ApiFile;
  };
  username: string;
  phone_number: string;
  access_hash?: string;

  // Obtained from UserFullInfo
  bio?: string;
}

export interface ApiUserStatus {
  '@type': (
    'userStatusEmpty' | 'userStatusLastMonth' | 'userStatusLastWeek' |
    'userStatusOffline' | 'userStatusOnline' | 'userStatusRecently'
  );
  was_online?: number;
}
