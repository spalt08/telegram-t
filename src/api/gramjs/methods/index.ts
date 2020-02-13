import { destroy, downloadMedia } from './client';
import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration, restartAuth,
} from './auth';
import { fetchChats, fetchFullChat, fetchChatOnlines } from './chats';
import {
  fetchMessages, fetchMessage, sendMessage, pinMessage, deleteMessages, markMessagesRead, searchMessages,
  fetchWebPagePreview,
} from './messages';
import {
  fetchFullUser, fetchNearestCountry, fetchUserFromMessage, uploadProfilePhoto,
} from './users';
import {
  fetchStickers, fetchRecentStickers, fetchStickerSet,
} from './stickers';

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
  searchMessages,
  fetchWebPagePreview,
  fetchFullChat,
  fetchChatOnlines,
  fetchFullUser,
  fetchUserFromMessage,
  fetchNearestCountry,
  uploadProfilePhoto,
  fetchStickers,
  fetchRecentStickers,
  fetchStickerSet,
};
