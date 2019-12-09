import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword,
} from './connectors/auth';
import { fetchChats } from './connectors/chats';
import { fetchMessages, sendMessage } from './connectors/messages';
import { loadAvatar } from './connectors/files';

export default {
  provideAuthPhoneNumber,
  provideAuthCode,
  provideAuthPassword,
  fetchChats,
  fetchMessages,
  sendMessage,
  loadAvatar,
};
