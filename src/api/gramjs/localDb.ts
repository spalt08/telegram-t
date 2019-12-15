import { ApiMessage } from '../types';

export default <{
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
