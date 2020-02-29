import React, { FC, useCallback, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import captureEscKeyListener from '../../util/captureEscKeyListener';
import { selectCurrentMessageSearch } from '../../modules/selectors';

import RightHeader from './RightHeader';
import Profile from './Profile';
import RightSearch from './RightSearch';

import './RightColumn.scss';

type IProps = {
  isUserInfo: boolean;
  isChatInfo: boolean;
  isSearch: boolean;
  selectedChatId?: number;
  selectedUserId?: number;
} & Pick<GlobalActions, 'toggleChatInfo' | 'openUserInfo' | 'closeMessageTextSearch'>;

const RightColumn: FC<IProps> = ({
  isUserInfo,
  isChatInfo,
  isSearch,
  selectedChatId,
  selectedUserId,
  toggleChatInfo,
  openUserInfo,
  closeMessageTextSearch,
}) => {
  const isOpen = isSearch || isUserInfo || isChatInfo;
  const close = useCallback(() => {
    if (isSearch) {
      return closeMessageTextSearch();
    } else if (isUserInfo) {
      return openUserInfo({ id: undefined });
    } else if (isChatInfo) {
      return toggleChatInfo();
    }

    return undefined;
  }, [closeMessageTextSearch, isChatInfo, isSearch, isUserInfo, openUserInfo, toggleChatInfo]);

  useEffect(() => (isOpen ? captureEscKeyListener(close) : undefined), [isOpen, close]);

  if (!selectedUserId && !isChatInfo && !isSearch) {
    return null;
  }

  return (
    <div id="RightColumn">
      <RightHeader onClose={close} />
      {isSearch ? (
        <RightSearch chatId={selectedChatId} />
      ) : (isUserInfo || isChatInfo) ? (
        <Profile key={selectedUserId || selectedChatId} chatId={selectedChatId} userId={selectedUserId} />
      ) : null}
    </div>
  );
};

export default withGlobal(
  (global) => {
    const {
      chats,
      users,
      showChatInfo,
    } = global;

    const selectedChatId = chats.selectedId;
    const selectedUserId = users.selectedId;
    const areChatsLoaded = Boolean(chats.ids);

    const currentSearch = selectCurrentMessageSearch(global);

    return {
      isUserInfo: selectedUserId && areChatsLoaded,
      isChatInfo: selectedChatId && showChatInfo && areChatsLoaded,
      isSearch: currentSearch && currentSearch.currentType === 'text',
      selectedChatId,
      selectedUserId,
    };
  },
  (setGlobal, actions) => {
    const { openUserInfo, toggleChatInfo, closeMessageTextSearch } = actions;
    return { openUserInfo, toggleChatInfo, closeMessageTextSearch };
  },
)(RightColumn);
