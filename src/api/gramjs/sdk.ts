import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration,
} from './connectors/auth';
import { fetchChats, fetchFullChat, fetchChatOnlines } from './connectors/chats';
import { fetchMessages, sendMessage, pinMessage } from './connectors/messages';
import { fetchFullUser } from './connectors/users';
import { downloadMedia } from './client';

export default {
  provideAuthPhoneNumber,
  provideAuthCode,
  provideAuthPassword,
  provideAuthRegistration,
  fetchChats,
  fetchMessages,
  sendMessage,
  pinMessage,
  downloadMedia,
  fetchFullChat,
  fetchChatOnlines,
  fetchFullUser,
};
