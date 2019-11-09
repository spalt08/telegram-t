export interface ApiUser {
  id: number;
  type: {
    '@type': 'userTypeBot' | 'userTypeRegular' | 'userTypeDeleted' | 'userTypeUnknown';
  };
  first_name?: string;
  last_name?: string;
  status?: {
    '@type': (
      'userStatusEmpty' | 'userStatusLastMonth' | 'userStatusLastWeek' |
      'userStatusOffline' | 'userStatusOnline' | 'userStatusRecently'
      );
    was_online?: number;
  };
}
