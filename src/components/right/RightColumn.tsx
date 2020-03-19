import React, {
  FC, useCallback, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import captureEscKeyListener from '../../util/captureEscKeyListener';
import {
  selectCurrentMessageSearch,
  selectIsForwardMenuOpen,
  selectIsMediaViewerOpen,
} from '../../modules/selectors';

import ForwardPicker from '../common/ForwardPicker';
import RightHeader from './RightHeader';
import Profile from './Profile';
import RightSearch from './RightSearch';
import Transition from '../ui/Transition';

import './RightColumn.scss';

enum ColumnContent {
  ChatInfo,
  UserInfo,
  Search,
  Forward,
}

type IProps = {
  contentKey?: ColumnContent;
  selectedChatId?: number;
  selectedUserId?: number;
} & Pick<GlobalActions, 'toggleChatInfo' | 'openUserInfo' | 'closeMessageTextSearch' | 'closeForwardMenu'>;

const TRANSITION_RENDER_COUNT = 4;

const RightColumn: FC<IProps> = ({
  contentKey,
  selectedChatId,
  selectedUserId,
  toggleChatInfo,
  openUserInfo,
  closeMessageTextSearch,
  closeForwardMenu,
}) => {
  const isOpen = contentKey !== undefined;
  const close = useCallback(() => {
    switch (contentKey) {
      case ColumnContent.ChatInfo:
        toggleChatInfo();
        break;
      case ColumnContent.UserInfo:
        openUserInfo({ id: undefined });
        break;
      case ColumnContent.Search:
        closeMessageTextSearch();
        break;
      case ColumnContent.Forward:
        closeForwardMenu();
        break;
    }
  }, [closeForwardMenu, closeMessageTextSearch, contentKey, openUserInfo, toggleChatInfo]);

  useEffect(() => (isOpen ? captureEscKeyListener(close) : undefined), [isOpen, close]);

  if (!isOpen) {
    return null;
  }

  function renderContent() {
    switch (contentKey) {
      case ColumnContent.Search:
        return <RightSearch chatId={selectedChatId} />;
      case ColumnContent.Forward:
        return <ForwardPicker />;
      default:
        return <Profile key={selectedUserId || selectedChatId} chatId={selectedChatId} userId={selectedUserId} />;
    }
  }

  const isSearch = contentKey === ColumnContent.Search;
  const isForwarding = contentKey === ColumnContent.Forward;

  return (
    <div id="RightColumn">
      <RightHeader onClose={close} isSearch={isSearch} isForwarding={isForwarding} />
      <Transition name="zoom-fade" renderCount={TRANSITION_RENDER_COUNT} activeKey={contentKey}>
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

    const isForwarding = selectIsForwardMenuOpen(global) && !selectIsMediaViewerOpen(global);
    const currentSearch = selectCurrentMessageSearch(global);
    const isSearch = currentSearch && currentSearch.currentType === 'text';
    const selectedChatId = chats.selectedId;
    const selectedUserId = users.selectedId;
    const areChatsLoaded = Boolean(chats.listIds);
    const isUserInfo = selectedUserId && areChatsLoaded;
    const isChatInfo = selectedChatId && showChatInfo && areChatsLoaded;

    const contentKey = isForwarding ? (
      ColumnContent.Forward
    ) : isSearch ? (
      ColumnContent.Search
    ) : isUserInfo ? (
      ColumnContent.UserInfo
    ) : isChatInfo ? (
      ColumnContent.ChatInfo
    ) : undefined;

    return {
      contentKey,
      selectedChatId,
      selectedUserId,
    };
  },
  (setGlobal, actions) => {
    const {
      openUserInfo, toggleChatInfo, closeMessageTextSearch, closeForwardMenu,
    } = actions;
    return {
      openUserInfo, toggleChatInfo, closeMessageTextSearch, closeForwardMenu,
    };
  },
)(RightColumn);
