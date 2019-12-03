import { ApiMessage } from '../types';
import { Api as GramJs } from '../../lib/gramjs';

export default <{
  chats: Record<number, GramJs.Chat | GramJs.Channel>;
  users: Record<number, GramJs.User>;
  localMessages: Record<string, ApiMessage>;
  // TODO Replace with persistent storage for all downloads.
  avatarRequests: Record<number, Promise<string | null>>;
  mediaRequests: Record<number, Promise<string | null>>;
}> {
  chats: {},
  users: {},
  localMessages: {},
  avatarRequests: {},
  mediaRequests: {},
};
