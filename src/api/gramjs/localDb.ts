import { ApiMessage } from '../types';

export default <{
  chats: Record<number, MTP.chat | MTP.channel>;
  users: Record<number, MTP.user>;
  localMessages: Record<string, ApiMessage>;
  // TODO Replace with persistent storage for all downloads.
  avatarRequests: Record<number, Promise<string>>;
  mediaRequests: Record<number, Promise<string>>;
}> {
  chats: {},
  users: {},
  localMessages: {},
  avatarRequests: {},
  mediaRequests: {},
};
