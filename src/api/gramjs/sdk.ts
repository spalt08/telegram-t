import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration,
} from './connectors/auth';
import { fetchChats, fetchFullChat, fetchChatOnlines } from './connectors/chats';
import {
  fetchMessages, sendMessage, pinMessage, deleteMessages,
} from './connectors/messages';
import { fetchFullUser, fetchNearestCountry } from './connectors/users';
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
  deleteMessages,
  downloadMedia,
  fetchFullChat,
  fetchChatOnlines,
  fetchFullUser,
  fetchNearestCountry,
};
