import { ApiMessage } from '../types';
import { Api as GramJs } from '../../lib/gramjs';

export default <{
  localMessages: Record<string, ApiMessage>;
  // Used for loading avatars and media through in-memory Gram JS instances.
  chats: Record<number, GramJs.Chat | GramJs.Channel>;
  users: Record<number, GramJs.User>;
  messages: Record<string, GramJs.Message>;
}>{
  localMessages: {},
  chats: {},
  users: {},
  messages: {},
};
