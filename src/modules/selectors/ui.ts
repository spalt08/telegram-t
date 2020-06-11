import { GlobalState } from '../../global/types';
import { RightColumnContent } from '../../types';

import { selectIsForwardMenuOpen } from './messages';
import { selectCurrentMessageSearch } from './messageSearch';
import { selectCurrentStickerSearch, selectCurrentGifSearch } from './symbols';
import { selectAreActiveChatsLoaded } from './chats';

export function selectIsMediaViewerOpen(global: GlobalState) {
  const { mediaViewer } = global;
  return Boolean(mediaViewer.chatId);
}

export function selectRightColumnContentKey(global: GlobalState) {
  const {
    chats,
    users,
    isChatInfoShown,
    isStatisticsShown,
  } = global;

  const isForwarding = selectIsForwardMenuOpen(global) && !selectIsMediaViewerOpen(global);
  const messageSearch = selectCurrentMessageSearch(global);
  const isSearch = Boolean(messageSearch && messageSearch.currentType === 'text');
  const stickerSearch = selectCurrentStickerSearch(global);
  const isStickerSearch = stickerSearch.query !== undefined;
  const gifSearch = selectCurrentGifSearch(global);
  const isGifSearch = gifSearch.query !== undefined;
  const selectedChatId = chats.selectedId;
  const selectedUserId = users.selectedId;
  const areActiveChatsLoaded = selectAreActiveChatsLoaded(global);
  const isUserInfo = Boolean(selectedUserId && areActiveChatsLoaded);
  const isChatShown = Boolean(selectedChatId && areActiveChatsLoaded);
  const isChatInfo = isChatShown && isChatInfoShown;

  return isForwarding ? (
    RightColumnContent.Forward
  ) : isSearch ? (
    RightColumnContent.Search
  ) : isStickerSearch ? (
    RightColumnContent.StickerSearch
  ) : isGifSearch ? (
    RightColumnContent.GifSearch
  ) : isStatisticsShown ? (
    RightColumnContent.Statistics
  ) : isUserInfo ? (
    RightColumnContent.UserInfo
  ) : isChatInfo ? (
    RightColumnContent.ChatInfo
  ) : undefined;
}

export function selectIsRightColumnShown(global: GlobalState) {
  return selectRightColumnContentKey(global) !== undefined;
}
