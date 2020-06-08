import { GlobalState } from '../../global/types';

import { selectIsForwardMenuOpen } from './messages';
import { selectCurrentMessageSearch } from './messageSearch';
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
  const currentSearch = selectCurrentMessageSearch(global);
  const isSearch = Boolean(currentSearch && currentSearch.currentType === 'text');
  const isUserInfo = Boolean(users.selectedId && areActiveChatsLoaded);
  const isChatInfo = Boolean(chats.selectedId && isChatInfoShown && areActiveChatsLoaded);

  return isChatInfo || isUserInfo || isStatisticsShown || isForwarding || isSearch;
}
