import { destroy, downloadMedia } from './client';
import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration, restartAuth,
} from './auth';
import {
  fetchChats, fetchFullChat, fetchSuperGroupOnlines, requestChatUpdate,
} from './chats';
import {
  fetchMessages, fetchMessage, sendMessage, pinMessage, deleteMessages, markMessagesRead, readMessageContents,
  searchMessages, fetchWebPagePreview, sendPollVote,
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
  sendPollVote,
  fetchFullChat,
  fetchSuperGroupOnlines,
  requestChatUpdate,
  fetchFullUser,
  fetchNearestCountry,
  uploadProfilePhoto,
  fetchTopUsers,
  fetchStickerSets,
  fetchRecentStickers,
  fetchStickers,
  fetchSavedGifs,
};
