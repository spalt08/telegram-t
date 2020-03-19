import React, {
  FC, useCallback, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import captureEscKeyListener from '../../util/captureEscKeyListener';
import { selectCurrentMessageSearch } from '../../modules/selectors';

import RightHeader from './RightHeader';
import Profile from './Profile';
import RightSearch from './RightSearch';
import Transition from '../ui/Transition';

import './RightColumn.scss';

enum ColumnContent {
  // eslint-disable-next-line no-shadow
  Profile,
  Search,
}

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
  const columnContent = isSearch ? ColumnContent.Search : ColumnContent.Profile;
  const close = useCallback(() => {
    if (isSearch) {
      closeMessageTextSearch();
    } else if (isUserInfo) {
      openUserInfo({ id: undefined });
    } else if (isChatInfo) {
      toggleChatInfo();
    }
  }, [isChatInfo, isSearch, isUserInfo, closeMessageTextSearch, openUserInfo, toggleChatInfo]);

  useEffect(() => (isOpen ? captureEscKeyListener(close) : undefined), [isOpen, close]);

  if (!isOpen) {
    return null;
  }

  function renderContent() {
    return (
      isSearch ? (
        <RightSearch chatId={selectedChatId} />
      ) : (isUserInfo || isChatInfo) ? (
        <Profile key={selectedUserId || selectedChatId} chatId={selectedChatId} userId={selectedUserId} />
      ) : null
    );
  }

  return (
    <div id="RightColumn">
      <RightHeader onClose={close} isSearchOpen={isSearch} />
      <Transition activeKey={columnContent} name="zoom-fade">
        {renderContent}
      </Transition>
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
    const areChatsLoaded = Boolean(chats.listIds);

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
