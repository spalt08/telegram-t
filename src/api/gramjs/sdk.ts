import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration, restartAuth,
} from './connectors/auth';
import { fetchChats, fetchFullChat, fetchChatOnlines } from './connectors/chats';
import {
  fetchMessages, sendMessage, pinMessage, deleteMessages, markMessagesRead,
} from './connectors/messages';
import { fetchFullUser, fetchNearestCountry } from './connectors/users';
import { downloadMedia } from './client';

export default {
  provideAuthPhoneNumber,
  provideAuthCode,
  provideAuthPassword,
  provideAuthRegistration,
  restartAuth,
  fetchChats,
  fetchMessages,
  sendMessage,
  pinMessage,
  deleteMessages,
  markMessagesRead,
  downloadMedia,
  fetchFullChat,
  fetchChatOnlines,
  fetchFullUser,
  fetchNearestCountry,
};
