import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import captureEscKeyListener from '../../util/captureEscKeyListener';
import { selectCurrentMessageSearch } from '../../modules/selectors';

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
  const isInfo = showRightColumn && selectedChatId;
  const isSearch = isSearchActive;

  useEffect(() => {
    if (isSearch) {
      return captureEscKeyListener(closeMessageSearch);
    }
    return isInfo ? captureEscKeyListener(toggleRightColumn) : undefined;
  }, [toggleRightColumn, closeMessageSearch, isInfo, isSearch]);

  if (!isInfo && !isSearch) {
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
    } = global;

    const areChatsLoaded = Boolean(chats.ids);
    const selectedChatId = chats.selectedId;
    const selectedUserId = users.selectedId;

    const currentSearch = selectCurrentMessageSearch(global);

    return {
      showRightColumn,
      isSearchActive: currentSearch && currentSearch.currentType === 'text',
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
