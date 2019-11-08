import { ApiMessage } from './messages';

export interface ApiChat {
  id: number;
  title?: string;
  last_message?: ApiMessage;
  last_read_outbox_message_id: number;
  order: string;
}
