import { destroy, downloadMedia } from './client';
import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration, restartAuth,
} from './auth';
import { fetchChats, fetchFullChat, fetchSuperGroupOnlines } from './chats';
import {
  fetchMessages, fetchMessage, sendMessage, pinMessage, deleteMessages, markMessagesRead, readMessageContents,
  searchMessages, fetchWebPagePreview,
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
  readMessageContents,
  searchMessages,
  fetchWebPagePreview,
  fetchFullChat,
  fetchSuperGroupOnlines,
  fetchFullUser,
  fetchUserFromMessage,
  fetchNearestCountry,
  uploadProfilePhoto,
  fetchStickers,
  fetchRecentStickers,
  fetchStickerSet,
};
