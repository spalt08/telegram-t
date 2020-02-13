import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import captureEscKeyListener from '../../util/captureEscKeyListener';

import RightHeader from './RightHeader';
import RightColumnInfo from './RightColumnInfo';
import RightSearch from './RightSearch';

import './RightColumn.scss';

type IProps = {
  showRightColumn: boolean;
  isSearchActive: boolean;
  areChatsLoaded: boolean;
  selectedChatId?: number;
  selectedUserId?: number;
} & Pick<GlobalActions, 'toggleRightColumn' | 'closeMessageSearch'>;

const RightColumn: FC<IProps> = ({
  showRightColumn,
  isSearchActive,
  areChatsLoaded,
  selectedChatId,
  selectedUserId,
  toggleRightColumn,
  closeMessageSearch,
}) => {
  const isOpen = showRightColumn && selectedChatId;
  const isSearch = isOpen && isSearchActive;

  useEffect(() => {
    if (isSearch) {
      return captureEscKeyListener(closeMessageSearch);
    }
    return isOpen ? captureEscKeyListener(toggleRightColumn) : undefined;
  }, [toggleRightColumn, closeMessageSearch, isOpen, isSearch]);

  if (!isOpen) {
    return null;
  }

  return (
    <div id="RightColumn">
      <RightHeader />
      {!isSearch && areChatsLoaded && (
        <RightColumnInfo key={selectedUserId || selectedChatId} chatId={selectedChatId} userId={selectedUserId} />
      )}
      {isSearch && areChatsLoaded && (
        <RightSearch chatId={selectedChatId} />
      )}
    </div>
  );
};

export default withGlobal(
  (global) => {
    const {
      chats,
      users,
      showRightColumn,
      messageSearch,
    } = global;

    const areChatsLoaded = Boolean(chats.ids);
    const selectedChatId = chats.selectedId;
    const selectedUserId = users.selectedId;

    return {
      showRightColumn,
      isSearchActive: messageSearch.isTextSearch,
      selectedChatId,
      selectedUserId,
      areChatsLoaded,
    };
  },
  (setGlobal, actions) => {
    const { toggleRightColumn, closeMessageSearch } = actions;
    return { toggleRightColumn, closeMessageSearch };
  },
)(RightColumn);
