import React, {
  FC, useCallback, useEffect, useState, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN } from '../../config';
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

import RightHeader from './RightHeader';
import Profile, { ProfileState } from './Profile';
import Transition from '../ui/Transition';
import ForwardPicker from '../common/ForwardPicker.async';
import RightSearch from './RightSearch.async';
import Statistics from './Statistics.async';

import './RightColumn.scss';

enum ColumnContent {
  ChatInfo,
  UserInfo,
  // eslint-disable-next-line no-shadow
  Statistics,
  Search,
  Forward,
}

type StateProps = {
  contentKey?: ColumnContent;
  selectedChatId?: number;
  selectedUserId?: number;
  shouldPreload?: boolean;
};

type DispatchProps = Pick<GlobalActions, (
  'toggleChatInfo' | 'toggleStatistics' | 'openUserInfo' | 'closeMessageTextSearch' | 'closeForwardMenu'
)>;

const COLUMN_CLOSE_DELAY_MS = 300;
const TRANSITION_RENDER_COUNT = Object.keys(ColumnContent).length / 2;

const RightColumn: FC<StateProps & DispatchProps> = ({
  contentKey,
  selectedChatId,
  selectedUserId,
  shouldPreload,
  toggleChatInfo,
  toggleStatistics,
  openUserInfo,
  closeMessageTextSearch,
  closeForwardMenu,
}) => {
  const [profileState, setProfileState] = useState<ProfileState>(ProfileState.Profile);
  const isScrolledDown = profileState !== ProfileState.Profile;

  const isOpen = contentKey !== undefined;
  const isSearch = contentKey === ColumnContent.Search;
  const isForwarding = contentKey === ColumnContent.Forward;
  const isStatistics = contentKey === ColumnContent.Statistics;
  const isOverlaying = window.innerWidth <= MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN;

  const [shouldSkipTransition, setShouldSkipTransition] = useState(!isOpen);

  const previousContentKey = usePrevious(contentKey, true);
  const renderedContentKey = contentKey !== undefined
    ? contentKey
    : previousContentKey !== null
      ? previousContentKey
      : shouldPreload
        ? ColumnContent.ChatInfo
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
      case ColumnContent.Statistics:
        toggleStatistics();
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
  }, [
    contentKey, isScrolledDown, toggleChatInfo, openUserInfo,
    toggleStatistics, closeForwardMenu, closeMessageTextSearch,
  ]);

  useEffect(() => (isOpen ? captureEscKeyListener(close) : undefined), [isOpen, close]);

  useEffect(() => {
    setTimeout(() => {
      setShouldSkipTransition(!isOpen);
    }, COLUMN_CLOSE_DELAY_MS);
  }, [isOpen]);

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
      case ColumnContent.Statistics:
        return <Statistics />;
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
          isStatistics={isStatistics}
          profileState={profileState}
        />
        <Transition
          name={shouldSkipTransition ? 'none' : 'zoom-fade'}
          renderCount={TRANSITION_RENDER_COUNT}
          activeKey={renderedContentKey}
        >
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
      isStatisticsShown,
      uiReadyState,
    } = global;

    const isForwarding = selectIsForwardMenuOpen(global) && !selectIsMediaViewerOpen(global);
    const currentSearch = selectCurrentMessageSearch(global);
    const isSearch = Boolean(currentSearch && currentSearch.currentType === 'text');
    const selectedChatId = chats.selectedId;
    const selectedUserId = users.selectedId;
    const areChatsLoaded = Boolean(chats.listIds);
    const isUserInfo = Boolean(selectedUserId && areChatsLoaded);
    const isChatShown = Boolean(selectedChatId && areChatsLoaded);
    const isChatInfo = isChatShown && isChatInfoShown;
    const shouldPreload = isChatShown && uiReadyState === 2;

    const contentKey = isForwarding ? (
      ColumnContent.Forward
    ) : isSearch ? (
      ColumnContent.Search
    ) : isStatisticsShown ? (
      ColumnContent.Statistics
    ) : isUserInfo ? (
      ColumnContent.UserInfo
    ) : isChatInfo ? (
      ColumnContent.ChatInfo
    ) : undefined;

    return {
      contentKey,
      selectedChatId,
      selectedUserId,
      shouldPreload,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'openUserInfo',
    'toggleChatInfo',
    'toggleStatistics',
    'closeMessageTextSearch',
    'closeForwardMenu',
  ]),
)(RightColumn));
