import { destroy, downloadMedia } from './client';
import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration, restartAuth,
} from './auth';
import { fetchChats, fetchFullChat, fetchChatOnlines } from './chats';
import {
  fetchMessages, fetchMessage, sendMessage, pinMessage, deleteMessages, markMessagesRead,
} from './messages';
import {
  fetchFullUser, fetchNearestCountry, fetchUserFromMessage, uploadProfilePhoto,
} from './users';

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
  fetchMessage,
  sendMessage,
  pinMessage,
  deleteMessages,
  markMessagesRead,
  fetchFullChat,
  fetchChatOnlines,
  fetchFullUser,
  fetchUserFromMessage,
  fetchNearestCountry,
  uploadProfilePhoto,
};
