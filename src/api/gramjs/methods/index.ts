import { destroy, downloadMedia } from './client';
import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration, restartAuth,
} from './auth';
import {
  fetchChats, fetchFullChat, fetchSuperGroupOnlines, fetchChatLastMessage,
} from './chats';
import {
  fetchMessages, fetchMessage, sendMessage, pinMessage, deleteMessages, markMessagesRead, readMessageContents,
  searchMessages, fetchWebPagePreview,
} from './messages';
import {
  fetchFullUser, fetchNearestCountry, uploadProfilePhoto, fetchTopUsers,
} from './users';
import {
  fetchStickerSets, fetchRecentStickers, fetchStickers, fetchSavedGifs,
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
  fetchChatLastMessage,
  fetchFullUser,
  fetchNearestCountry,
  uploadProfilePhoto,
  fetchTopUsers,
  fetchStickerSets,
  fetchRecentStickers,
  fetchStickers,
  fetchSavedGifs,
};
