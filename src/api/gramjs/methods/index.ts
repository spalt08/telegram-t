import { destroy, downloadMedia, fetchCurrentUser } from './client';
import {
  provideAuthPhoneNumber, provideAuthCode, provideAuthPassword, provideAuthRegistration, restartAuth, restartAuthWithQr,
} from './auth';
import {
  fetchChats, fetchFullChat, fetchSuperGroupOnlines, searchChats, requestChatUpdate,
  saveDraft, clearDraft, fetchSupportChat, fetchChatWithSelf, markChatRead,
  createChannel, editChannelPhoto, joinChannel, createGroupChat, editChatPhoto,
} from './chats';
import {
  fetchMessages, fetchMessage, sendMessage, pinMessage, deleteMessages, markMessagesRead,
  searchMessages, searchMessagesGlobal, fetchWebPagePreview, sendPollVote, editMessage, forwardMessages,
} from './messages';
import {
  fetchFullUser, fetchNearestCountry, uploadProfilePhoto,
  updateProfile, updateProfilePhoto, checkUsername, updateUsername,
  fetchTopUsers, fetchContactList, fetchUsers,
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
  restartAuthWithQr,
  fetchChats,
  fetchMessages,
  fetchMessage,
  sendMessage,
  pinMessage,
  deleteMessages,
  markChatRead,
  createChannel,
  editChannelPhoto,
  joinChannel,
  createGroupChat,
  editChatPhoto,
  markMessagesRead,
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
  updateProfile,
  updateProfilePhoto,
  checkUsername,
  updateUsername,
  fetchCurrentUser,
  fetchTopUsers,
  fetchContactList,
  fetchUsers,
  fetchStickerSets,
  fetchRecentStickers,
  fetchStickers,
  fetchSavedGifs,
};
