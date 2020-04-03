import React, {
  FC, useCallback, useEffect, useMemo, useRef, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiMessage } from '../../api/types';
import { GlobalActions } from '../../global/types';

import { SHARED_MEDIA_SLICE } from '../../config';
import { getMessageContentIds, isChatPrivate } from '../../modules/helpers';
import { selectChatMessages } from '../../modules/selectors';
import { throttle } from '../../util/schedulers';
import fastSmoothScroll from '../../util/fastSmoothScroll';

import Transition from '../ui/Transition';
import InfiniteScroll from '../ui/InfiniteScroll';
import TabList from '../ui/TabList';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import Document from '../common/Document';
import Audio from '../common/Audio';
import UserExtra from './UserExtra';
import GroupExtra from './ChatExtra';
import Media from './sharedMedia/Media';
import WebLink from './sharedMedia/WebLink';

import './Profile.scss';

type OwnProps = {
  chatId: number;
  userId?: number;
  isSharedMedia: boolean;
  onSharedMediaToggle: (isSharedMedia: boolean) => void;
};

type StateProps = {
  resolvedUserId?: number;
  chatMessages: Record<number, ApiMessage>;
  isSearchTypeEmpty?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'setMessageSearchMediaType' | 'searchMessages' | 'openMediaViewer'>;

const TAB_TITLES = [
  'Media',
  'Docs',
  'Links',
  'Audio',
];

const MEDIA_TYPES = [
  'media',
  'documents',
  'links',
  'audio',
] as const;

const runThrottledForScroll = throttle((cb) => cb(), 250, false);
const PROGRAMMATIC_SCROLL_TIMEOUT_MS = 1000;

let isScrollingProgrammatically = false;

const Profile: FC<OwnProps & StateProps & DispatchProps> = ({
  chatId,
  isSharedMedia,
  onSharedMediaToggle,
  resolvedUserId,
  chatMessages,
  isSearchTypeEmpty,
  setMessageSearchMediaType,
  searchMessages,
  openMediaViewer,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState(0);

  const mediaType = MEDIA_TYPES[activeTab];

  const messageIds = useMemo(
    () => (mediaType && chatMessages ? getMessageContentIds(chatMessages, mediaType).reverse() : []),
    [chatMessages, mediaType],
  );

  useEffect(() => {
    if (mediaType) {
      setMessageSearchMediaType({ mediaType });
    }
  }, [mediaType, setMessageSearchMediaType, isSearchTypeEmpty]);

  // Set `min-height` for shared media container to prevent jumping when switching tabs
  useEffect(() => {
    function setMinHeight() {
      const container = containerRef.current!;
      const transitionEl = container.querySelector<HTMLDivElement>('.Transition')!;
      const tabsEl = container.querySelector<HTMLDivElement>('.TabList')!;
      transitionEl.style.minHeight = `${container.offsetHeight - tabsEl.offsetHeight}px`;
    }

    setMinHeight();

    window.addEventListener('resize', setMinHeight, false);

    return () => {
      window.removeEventListener('resize', setMinHeight, false);
    };
  }, []);

  const determineSharedMedia = useCallback(() => {
    const container = containerRef.current!;
    const chatInfoEl = container.querySelector<HTMLDivElement>('.ChatInfo')!;
    const chatExtraEl = container.querySelector<HTMLDivElement>('.ChatExtra');

    onSharedMediaToggle(container.scrollTop >= (
      chatInfoEl.offsetHeight + 16 + (chatExtraEl ? chatExtraEl.offsetHeight : 0)
    ));
  }, [onSharedMediaToggle]);

  useEffect(() => {
    const container = containerRef.current!;
    const tabsEl = container.querySelector<HTMLDivElement>('.TabList')!;
    const chatInfoEl = container.querySelector<HTMLDivElement>('.ChatInfo')!;

    if (!isSharedMedia && tabsEl.offsetTop - container.scrollTop === 0) {
      isScrollingProgrammatically = true;
      fastSmoothScroll(containerRef.current!, chatInfoEl, 'start', container.offsetHeight * 2);
      setTimeout(() => {
        isScrollingProgrammatically = false;
        determineSharedMedia();
      }, PROGRAMMATIC_SCROLL_TIMEOUT_MS);
    }
  }, [determineSharedMedia, isSharedMedia]);

  const handleScroll = useCallback(() => {
    if (isScrollingProgrammatically) {
      return;
    }

    runThrottledForScroll(determineSharedMedia);
  }, [determineSharedMedia]);

  // Workaround for scrollable content flickering during animation.
  const handleTransitionStart = useCallback(() => {
    const container = containerRef.current!;
    if (container.style.overflowY !== 'hidden') {
      const scrollBarWidth = container.offsetWidth - container.clientWidth;
      container.style.overflowY = 'hidden';
      container.style.marginRight = `${scrollBarWidth}px`;
    }
  }, []);

  const handleTransitionStop = useCallback(() => {
    const container = containerRef.current!;
    container.style.overflowY = 'scroll';
    container.style.marginRight = '0';
  }, []);

  const handleSelectMedia = useCallback((messageId) => {
    openMediaViewer({ chatId: resolvedUserId || chatId, messageId, isReversed: true });
  }, [chatId, resolvedUserId, openMediaViewer]);

  function renderSharedMedia() {
    return (
      <div className={`content ${mediaType}-list`}>
        {mediaType === 'media' ? (
          messageIds.map((id) => (
            <Media
              key={id}
              message={chatMessages[id]}
              onClick={handleSelectMedia}
            />
          ))
        ) : mediaType === 'documents' ? (
          messageIds.map((id) => (
            <Document key={id} message={chatMessages[id]} showTimeStamp smaller />
          ))
        ) : mediaType === 'links' ? (
          messageIds.map((id) => (
            <WebLink
              key={id}
              message={chatMessages[id]}
            />
          ))
        ) : mediaType === 'audio' ? (
          messageIds.map((id) => (
            <Audio
              key={id}
              inSharedMedia
              message={chatMessages[id]}
              date={chatMessages[id].date}
            />
          ))
        ) : null}
      </div>
    );
  }

  return (
    <InfiniteScroll
      ref={containerRef}
      className="Profile custom-scroll"
      items={messageIds}
      preloadBackwards={SHARED_MEDIA_SLICE}
      onLoadMore={searchMessages}
      onScroll={handleScroll}
    >
      {resolvedUserId ? [
        <PrivateChatInfo userId={resolvedUserId} avatarSize="jumbo" showFullInfo />,
        <UserExtra userId={resolvedUserId} />,
      ] : [
        <GroupChatInfo chatId={chatId} avatarSize="jumbo" showFullInfo />,
        <GroupExtra chatId={chatId} />,
      ]}
      <div className="shared-media">
        <Transition
          name="slide"
          activeKey={activeTab}
          renderCount={TAB_TITLES.length}
          shouldRestoreHeight
          onStart={handleTransitionStart}
          onStop={handleTransitionStop}
        >
          {renderSharedMedia}
        </Transition>
        <TabList activeTab={activeTab} tabs={TAB_TITLES} onSwitchTab={setActiveTab} />
      </div>
    </InfiniteScroll>
  );
};

export default withGlobal<OwnProps>(
  (global, { chatId, userId }) => {
    const chatMessages = selectChatMessages(global, userId || chatId);
    const { currentType: searchType } = global.messageSearch.byChatId[chatId] || {};

    let resolvedUserId;
    if (userId) {
      resolvedUserId = userId;
    } else if (isChatPrivate(chatId)) {
      resolvedUserId = chatId;
    }

    return {
      resolvedUserId,
      chatMessages,
      isSearchTypeEmpty: !searchType,
    };
  },
  (setGlobal, actions) => {
    const { setMessageSearchMediaType, searchMessages, openMediaViewer } = actions;
    return { setMessageSearchMediaType, searchMessages, openMediaViewer };
  },
)(Profile);
