import { ApiMessage } from './messages';
import { ApiFile, ApiFileLocation } from './files';

export interface ApiChat {
  id: number;
  type: {
    '@type': 'chatTypePrivate' | 'chatTypeSecret' | 'chatTypeBasicGroup' | 'chatTypeSupergroup';
    basic_group_id?: number;
    user_id?: number;
    supergroup_id?: number;
    is_channel?: boolean;
  };
  title?: string;
  last_message?: ApiMessage;
  last_read_outbox_message_id: number;
  last_read_inbox_message_id: number;
  unread_count: number;
  unread_mention_count: number;
  is_pinned: boolean;
  photo_locations?: {
    small: ApiFileLocation;
    big: ApiFileLocation;
  };
  access_hash: string;
  // Only in TDLib.
  photo?: {
    small: ApiFile;
    big: ApiFile;
  };
  order?: string;
}

export interface ApiPrivateChat extends ApiChat {
  type: {
    '@type': 'chatTypePrivate' | 'chatTypeSecret';
    user_id: number;
  };
}
