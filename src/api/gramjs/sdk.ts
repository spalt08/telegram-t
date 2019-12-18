import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword,
} from './connectors/auth';
import { fetchChats } from './connectors/chats';
import { fetchMessages, sendMessage } from './connectors/messages';
import { downloadMedia } from './client';

export default {
  provideAuthPhoneNumber,
  provideAuthCode,
  provideAuthPassword,
  fetchChats,
  fetchMessages,
  sendMessage,
  downloadMedia,
};
