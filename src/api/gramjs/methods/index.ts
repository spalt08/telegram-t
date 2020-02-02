import { destroy, downloadMedia } from './client';
import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration, restartAuth,
} from './auth';
import { fetchChats, fetchFullChat, fetchChatOnlines } from './chats';
import {
  fetchMessages, sendMessage, pinMessage, deleteMessages, markMessagesRead,
} from './messages';
import { fetchFullUser, fetchNearestCountry } from './users';

export default {
  destroy,
  downloadMedia,
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
  fetchFullChat,
  fetchChatOnlines,
  fetchFullUser,
  fetchNearestCountry,
};
