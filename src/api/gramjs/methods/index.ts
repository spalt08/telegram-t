import { destroy, downloadMedia } from './client';
import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration, restartAuth,
} from './auth';
import {
  fetchChats, fetchFullChat, fetchSuperGroupOnlines, searchChats, requestChatUpdate,
  saveDraft, clearDraft, fetchSupportChat, fetchChatWithSelf,
} from './chats';
import {
  fetchMessages, fetchMessage, sendMessage, pinMessage, deleteMessages, markMessagesRead, readMessageContents,
  searchMessages, searchMessagesGlobal, fetchWebPagePreview, sendPollVote, editMessage, forwardMessages,
} from './messages';
import {
  fetchFullUser, fetchNearestCountry, uploadProfilePhoto, fetchTopUsers, fetchContactList,
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
  searchMessagesGlobal,
  fetchWebPagePreview,
  sendPollVote,
  editMessage,
  forwardMessages,
  fetchFullChat,
  fetchSuperGroupOnlines,
  searchChats,
  fetchSupportChat,
  fetchChatWithSelf,
  requestChatUpdate,
  saveDraft,
  clearDraft,
  fetchFullUser,
  fetchNearestCountry,
  uploadProfilePhoto,
  fetchTopUsers,
  fetchContactList,
  fetchStickerSets,
  fetchRecentStickers,
  fetchStickers,
  fetchSavedGifs,
};
