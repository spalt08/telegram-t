import React, {
  FC, useCallback, useEffect, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import captureEscKeyListener from '../../util/captureEscKeyListener';
import {
  selectCurrentMessageSearch,
  selectIsForwardMenuOpen,
  selectIsMediaViewerOpen,
} from '../../modules/selectors';
import useLayoutEffectWithPrevDeps from '../../hooks/useLayoutEffectWithPrevDeps';

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

type StateProps = {
  contentKey?: ColumnContent;
  selectedChatId?: number;
  selectedUserId?: number;
};

type DispatchProps = Pick<GlobalActions, (
  'toggleChatInfo' | 'openUserInfo' | 'closeMessageTextSearch' | 'closeForwardMenu'
)>;

const TRANSITION_RENDER_COUNT = 4;

const RightColumn: FC<StateProps & DispatchProps> = ({
  contentKey,
  selectedChatId,
  selectedUserId,
  toggleChatInfo,
  openUserInfo,
  closeMessageTextSearch,
  closeForwardMenu,
}) => {
  const [isSharedMedia, setIsSharedMedia] = useState(false);

  const isOpen = contentKey !== undefined;
  const isSearch = contentKey === ColumnContent.Search;
  const isForwarding = contentKey === ColumnContent.Forward;

  const close = useCallback(() => {
    switch (contentKey) {
      case ColumnContent.ChatInfo:
        if (isSharedMedia) {
          setIsSharedMedia(false);
          break;
        }
        toggleChatInfo();
        break;
      case ColumnContent.UserInfo:
        if (isSharedMedia) {
          setIsSharedMedia(false);
          break;
        }
        openUserInfo({ id: undefined });
        break;
      case ColumnContent.Search:
        closeMessageTextSearch();
        break;
      case ColumnContent.Forward:
        closeForwardMenu();
        break;
    }
  }, [closeForwardMenu, closeMessageTextSearch, contentKey, openUserInfo, toggleChatInfo, isSharedMedia]);

  const handleSharedMediaToggle = useCallback((show: boolean) => {
    setIsSharedMedia(show);
  }, []);

  useEffect(() => (isOpen ? captureEscKeyListener(close) : undefined), [isOpen, close]);

  // We need to clear `isSharedMedia` state, when changing between `ChatInfo` and `UserInfo` to prevent confusion
  useLayoutEffectWithPrevDeps(([prevContentKey, prevSelectedChatId]) => {
    if (
      (prevContentKey === ColumnContent.ChatInfo && contentKey === ColumnContent.UserInfo)
      || (prevContentKey === ColumnContent.UserInfo && contentKey === ColumnContent.ChatInfo)
      || (prevSelectedChatId !== selectedChatId)
    ) {
      setIsSharedMedia(false);
    }
  }, [contentKey, selectedChatId]);

  if (!isOpen) {
    return null;
  }

  function renderContent() {
    switch (contentKey) {
      case ColumnContent.Search:
        return <RightSearch chatId={selectedChatId!} />;
      case ColumnContent.Forward:
        return <ForwardPicker />;
      default:
        return (
          <Profile
            key={selectedUserId || selectedChatId!}
            chatId={selectedChatId!}
            userId={selectedUserId}
            isSharedMedia={isSharedMedia}
            onSharedMediaToggle={handleSharedMediaToggle}
          />
        );
    }
  }

  return (
    <div id="RightColumn">
      <RightHeader
        onClose={close}
        isSearch={isSearch}
        isForwarding={isForwarding}
        isSharedMedia={isSharedMedia}
      />
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
    const isSearch = Boolean(currentSearch && currentSearch.currentType === 'text');
    const selectedChatId = chats.selectedId;
    const selectedUserId = users.selectedId;
    const areChatsLoaded = Boolean(chats.listIds);
    const isUserInfo = Boolean(selectedUserId && areChatsLoaded);
    const isChatInfo = Boolean(selectedChatId && showChatInfo && areChatsLoaded);

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
