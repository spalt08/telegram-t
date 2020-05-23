import React, {
  FC, useCallback, useEffect, useState, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import captureEscKeyListener from '../../util/captureEscKeyListener';
import { pick } from '../../util/iteratees';
import {
  selectCurrentMessageSearch,
  selectIsForwardMenuOpen,
  selectIsMediaViewerOpen,
} from '../../modules/selectors';
import useLayoutEffectWithPrevDeps from '../../hooks/useLayoutEffectWithPrevDeps';
import useShowTransition from '../../hooks/useShowTransition';
import useUpdateOnResize from '../../hooks/useUpdateOnResize';
import usePrevious from '../../hooks/usePrevious';
import { MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN } from '../../config';

import ForwardPicker from '../common/ForwardPicker.async';
import RightHeader from './RightHeader';
import Profile, { ProfileState } from './Profile';
import RightSearch from './RightSearch.async';
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
  const [profileState, setProfileState] = useState<ProfileState>(ProfileState.Profile);
  const isScrolledDown = profileState !== ProfileState.Profile;

  const isOpen = contentKey !== undefined;
  const isSearch = contentKey === ColumnContent.Search;
  const isForwarding = contentKey === ColumnContent.Forward;
  const isOverlaying = window.innerWidth <= MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN;

  const previousContentKey = usePrevious(contentKey, true);
  const renderedContentKey = contentKey !== undefined
    ? contentKey
    : previousContentKey !== null
      ? previousContentKey
      : undefined;

  useUpdateOnResize();

  const close = useCallback(() => {
    switch (contentKey) {
      case ColumnContent.ChatInfo:
        if (isScrolledDown) {
          setProfileState(ProfileState.Profile);
          break;
        }
        toggleChatInfo();
        break;
      case ColumnContent.UserInfo:
        if (isScrolledDown) {
          setProfileState(ProfileState.Profile);
          break;
        }
        openUserInfo({ id: undefined });
        break;
      case ColumnContent.Search: {
        const searchInput = document.querySelector('.RightHeader .SearchInput input') as HTMLInputElement;
        if (searchInput) {
          searchInput.blur();
        }
        closeMessageTextSearch();
        break;
      }
      case ColumnContent.Forward:
        closeForwardMenu();
        break;
    }
  }, [closeForwardMenu, closeMessageTextSearch, contentKey, openUserInfo, toggleChatInfo, isScrolledDown]);

  useEffect(() => (isOpen ? captureEscKeyListener(close) : undefined), [isOpen, close]);

  // Close Right Column when it transforms into overlayed state on screen resize
  useEffect(() => {
    if (isOpen && isOverlaying) {
      close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverlaying]);

  // We need to clear `isSharedMedia` state, when changing between `ChatInfo` and `UserInfo` to prevent confusion
  useLayoutEffectWithPrevDeps(([prevContentKey, prevSelectedChatId]) => {
    if (
      (prevContentKey === ColumnContent.ChatInfo && contentKey === ColumnContent.UserInfo)
      || (prevContentKey === ColumnContent.UserInfo && contentKey === ColumnContent.ChatInfo)
      || (prevSelectedChatId !== selectedChatId)
    ) {
      setProfileState(ProfileState.Profile);
    }
  }, [contentKey, selectedChatId]);

  const { transitionClassNames } = useShowTransition(isOpen, undefined, undefined, false);

  function renderContent() {
    switch (renderedContentKey) {
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
            profileState={profileState}
            onProfileStateChange={setProfileState}
          />
        );
    }
  }

  return (
    <div id="RightColumn-wrapper" className={transitionClassNames}>
      {isOverlaying && (
        <div className="overlay-backdrop" onClick={close} />
      )}
      <div id="RightColumn">
        <RightHeader
          onClose={close}
          isSearch={isSearch}
          isForwarding={isForwarding}
          profileState={profileState}
        />
        <Transition name="zoom-fade" renderCount={TRANSITION_RENDER_COUNT} activeKey={renderedContentKey}>
          {renderContent}
        </Transition>
      </div>
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const {
      chats,
      users,
      isChatInfoShown,
    } = global;

    const isForwarding = selectIsForwardMenuOpen(global) && !selectIsMediaViewerOpen(global);
    const currentSearch = selectCurrentMessageSearch(global);
    const isSearch = Boolean(currentSearch && currentSearch.currentType === 'text');
    const selectedChatId = chats.selectedId;
    const selectedUserId = users.selectedId;
    const areChatsLoaded = Boolean(chats.listIds);
    const isUserInfo = Boolean(selectedUserId && areChatsLoaded);
    const isChatInfo = Boolean(selectedChatId && isChatInfoShown && areChatsLoaded);

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
  (setGlobal, actions): DispatchProps => pick(actions, [
    'openUserInfo',
    'toggleChatInfo',
    'closeMessageTextSearch',
    'closeForwardMenu',
  ]),
)(RightColumn));
