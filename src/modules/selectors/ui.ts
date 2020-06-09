import { GlobalState } from '../../global/types';

import { selectIsForwardMenuOpen } from './messages';
import { selectCurrentMessageSearch } from './messageSearch';
import { selectCurrentStickerSearch, selectCurrentGifSearch } from './symbols';
import { selectAreActiveChatsLoaded } from './chats';

export function selectIsMediaViewerOpen(global: GlobalState) {
  const { mediaViewer } = global;
  return Boolean(mediaViewer.chatId);
}

export function selectIsRightColumnShown(global: GlobalState) {
  const {
    chats,
    users,
    isChatInfoShown,
    isStatisticsShown,
  } = global;

  const areActiveChatsLoaded = selectAreActiveChatsLoaded(global);
  const isForwarding = selectIsForwardMenuOpen(global) && !selectIsMediaViewerOpen(global);
  const messageSearch = selectCurrentMessageSearch(global);
  const isSearch = Boolean(messageSearch && messageSearch.currentType === 'text');
  const stickerSearch = selectCurrentStickerSearch(global);
  const isStickerSearch = stickerSearch.query !== undefined;
  const gifSearch = selectCurrentGifSearch(global);
  const isGifSearch = gifSearch.query !== undefined;
  const isUserInfo = Boolean(users.selectedId && areActiveChatsLoaded);
  const isChatInfo = Boolean(chats.selectedId && isChatInfoShown && areActiveChatsLoaded);

  return isChatInfo || isUserInfo || isStatisticsShown || isForwarding || isSearch || isStickerSearch || isGifSearch;
}
