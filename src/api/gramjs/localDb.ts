import { ApiMessage } from '../types';

export default <{
  chats: Record<number, MTP.chat | MTP.channel>;
  users: Record<number, MTP.user>;
  localMessages: Record<string, ApiMessage>;
}> {
  chats: {},
  users: {},
  localMessages: {},
};
