import { ApiMessage } from './messages';

export interface ApiChat {
  id: number;
  type: {
    '@type': 'chatTypePrivate' | 'chatTypeSecret' | 'chatTypeBasicGroup' | 'chatTypeSupergroup';
  }
  title?: string;
  last_message?: ApiMessage;
  last_read_outbox_message_id: number;
  last_read_inbox_message_id: number;
  unread_count: number;
  unread_mention_count: number;
  order: string;
}

export interface ApiPrivateChat extends ApiChat {
  type: {
    '@type': 'chatTypePrivate' | 'chatTypeSecret';
    user_id: number;
  }
}
