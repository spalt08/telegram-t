import { ApiMessage } from './messages';

export interface ApiChat {
  id: number;
  title?: string;
  last_message?: ApiMessage;
  date: number;
}
