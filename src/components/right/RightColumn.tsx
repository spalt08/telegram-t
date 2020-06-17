import React, {
  FC, useCallback, useEffect, useState, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { RightColumnContent } from '../../types';

import { MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN } from '../../config';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import { pick } from '../../util/iteratees';
import {
  selectAreActiveChatsLoaded,
  selectRightColumnContentKey,
} from '../../modules/selectors';
import useLayoutEffectWithPrevDeps from '../../hooks/useLayoutEffectWithPrevDeps';
import useUpdateOnResize from '../../hooks/useUpdateOnResize';
import usePrevious from '../../hooks/usePrevious';
import windowSize from '../../util/windowSize';

import RightHeader from './RightHeader';
import Profile, { ProfileState } from './Profile';
import Transition from '../ui/Transition';
import ForwardPicker from '../common/ForwardPicker.async';
import PollResults from './PollResults.async';
import RightSearch from './RightSearch.async';
import StickerSearch from './StickerSearch.async';
import GifSearch from './GifSearch.async';
import Statistics from './Statistics.async';

import './RightColumn.scss';

type StateProps = {
  contentKey?: RightColumnContent;
  selectedChatId?: number;
  selectedUserId?: number;
  shouldPreload?: boolean;
};

type DispatchProps = Pick<GlobalActions, (
  'toggleChatInfo' | 'toggleStatistics' | 'openUserInfo' |
  'closeMessageTextSearch' | 'closeForwardMenu' | 'closePollResults' |
  'setStickerSearchQuery' | 'setGifSearchQuery'
)>;

const COLUMN_CLOSE_DELAY_MS = 300;
const TRANSITION_RENDER_COUNT = Object.keys(RightColumnContent).length / 2;

function blurSearchInput() {
  const searchInput = document.querySelector('.RightHeader .SearchInput input') as HTMLInputElement;
  if (searchInput) {
    searchInput.blur();
  }
}

const RightColumn: FC<StateProps & DispatchProps> = ({
  contentKey,
  selectedChatId,
  selectedUserId,
  shouldPreload,
  toggleChatInfo,
  toggleStatistics,
  openUserInfo,
  closeMessageTextSearch,
  setStickerSearchQuery,
  setGifSearchQuery,
  closeForwardMenu,
  closePollResults,
}) => {
  const [profileState, setProfileState] = useState<ProfileState>(ProfileState.Profile);
  const isScrolledDown = profileState !== ProfileState.Profile;

  const isOpen = contentKey !== undefined;
  const isSearch = contentKey === RightColumnContent.Search;
  const isStickerSearch = contentKey === RightColumnContent.StickerSearch;
  const isGifSearch = contentKey === RightColumnContent.GifSearch;
  const isForwarding = contentKey === RightColumnContent.Forward;
  const isStatistics = contentKey === RightColumnContent.Statistics;
  const isPollResults = contentKey === RightColumnContent.PollResults;
  const isOverlaying = windowSize.get().width <= MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN;

  const [shouldSkipTransition, setShouldSkipTransition] = useState(!isOpen);

  const previousContentKey = usePrevious(contentKey, true);
  const renderedContentKey = contentKey !== undefined
    ? contentKey
    : previousContentKey !== null
      ? previousContentKey
      : shouldPreload
        ? RightColumnContent.ChatInfo
        : undefined;

  useUpdateOnResize();

  const close = useCallback(() => {
    switch (contentKey) {
      case RightColumnContent.ChatInfo:
        if (isScrolledDown) {
          setProfileState(ProfileState.Profile);
          break;
        }
        toggleChatInfo();
        break;
      case RightColumnContent.UserInfo:
        if (isScrolledDown) {
          setProfileState(ProfileState.Profile);
          break;
        }
        openUserInfo({ id: undefined });
        break;
      case RightColumnContent.Statistics:
        toggleStatistics();
        break;
      case RightColumnContent.Search: {
        blurSearchInput();
        closeMessageTextSearch();
        break;
      }
      case RightColumnContent.StickerSearch:
      case RightColumnContent.GifSearch: {
        blurSearchInput();
        setStickerSearchQuery({ query: undefined });
        setGifSearchQuery({ query: undefined });
        break;
      }
      case RightColumnContent.Forward:
        closeForwardMenu();
        break;
      case RightColumnContent.PollResults:
        closePollResults();
        break;
    }
  }, [
    contentKey, isScrolledDown, toggleChatInfo, openUserInfo,
    toggleStatistics, closeForwardMenu, closeMessageTextSearch, closePollResults,
    setStickerSearchQuery, setGifSearchQuery,
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
      (prevContentKey === RightColumnContent.ChatInfo && contentKey === RightColumnContent.UserInfo)
      || (prevContentKey === RightColumnContent.UserInfo && contentKey === RightColumnContent.ChatInfo)
      || (prevSelectedChatId !== selectedChatId)
    ) {
      setProfileState(ProfileState.Profile);
    }
  }, [contentKey, selectedChatId]);

  function renderContent() {
    switch (renderedContentKey) {
      case RightColumnContent.Search:
        return <RightSearch chatId={selectedChatId!} />;
      case RightColumnContent.StickerSearch:
        return <StickerSearch />;
      case RightColumnContent.GifSearch:
        return <GifSearch />;
      case RightColumnContent.Forward:
        return <ForwardPicker />;
      case RightColumnContent.Statistics:
        return <Statistics />;
      case RightColumnContent.PollResults:
        return <PollResults />;
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
    <div id="RightColumn-wrapper">
      {isOverlaying && (
        <div className="overlay-backdrop" onClick={close} />
      )}
      <div id="RightColumn">
        <RightHeader
          onClose={close}
          isColumnOpen={isOpen}
          isSearch={isSearch}
          isStickerSearch={isStickerSearch}
          isGifSearch={isGifSearch}
          isForwarding={isForwarding}
          isPollResults={isPollResults}
          isStatistics={isStatistics}
          profileState={profileState}
        />
        <Transition
          name={shouldSkipTransition ? 'none' : 'zoom-fade'}
          renderCount={TRANSITION_RENDER_COUNT}
          activeKey={renderedContentKey as number}
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
      uiReadyState,
    } = global;

    const selectedChatId = chats.selectedId;
    const selectedUserId = users.selectedId;
    const areActiveChatsLoaded = selectAreActiveChatsLoaded(global);
    const isChatShown = Boolean(selectedChatId && areActiveChatsLoaded);
    const shouldPreload = isChatShown && uiReadyState === 2;

    return {
      contentKey: selectRightColumnContentKey(global),
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
    'setStickerSearchQuery',
    'setGifSearchQuery',
    'closeForwardMenu',
    'closePollResults',
  ]),
)(RightColumn));
