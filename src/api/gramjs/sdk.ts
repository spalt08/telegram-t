import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration,
} from './connectors/auth';
import { fetchChats, fetchFullChat, fetchChatOnlines } from './connectors/chats';
import { fetchMessages, sendMessage } from './connectors/messages';
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
  downloadMedia,
  fetchFullChat,
  fetchChatOnlines,
  fetchFullUser,
};
