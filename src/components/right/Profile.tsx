import React, {
  FC, useCallback, useEffect, useMemo, useRef, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import {
  ApiMessage,
  ApiMessageSearchType,
  ApiChatMember,
  ApiUser,
} from '../../api/types';
import { GlobalActions } from '../../global/types';
import { MediaViewerOrigin } from '../../types';

import { SHARED_MEDIA_SLICE } from '../../config';
import {
  getMessageContentIds,
  isChatPrivate,
  getSortedUserIds,
  isChatBasicGroup,
} from '../../modules/helpers';
import { selectChatMessages, selectChat } from '../../modules/selectors';
import { throttle } from '../../util/schedulers';
import fastSmoothScroll from '../../util/fastSmoothScroll';

import Transition from '../ui/Transition';
import InfiniteScroll from '../ui/InfiniteScroll';
import TabList from '../ui/TabList';
import RippleEffect from '../ui/RippleEffect';
import Loading from '../ui/Loading';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import Document from '../common/Document';
import Audio from '../common/Audio';
import UserExtra from './UserExtra';
import GroupExtra from './ChatExtra';
import Media from './sharedMedia/Media';
import WebLink from './sharedMedia/WebLink';

import './Profile.scss';

export enum ProfileState {
  Profile,
  SharedMedia,
  MemberList,
}

type OwnProps = {
  chatId: number;
  userId?: number;
  profileState: ProfileState;
  onProfileStateChange: (state: ProfileState) => void;
};

type StateProps = {
  resolvedUserId?: number;
  chatMessages?: Record<number, ApiMessage>;
  isSearchTypeEmpty?: boolean;
  hasMembersTab?: boolean;
  groupChatMembers?: ApiChatMember[];
  usersById?: Record<number, ApiUser>;
};

type DispatchProps = Pick<GlobalActions, (
  'setMessageSearchMediaType' | 'searchMessages' | 'openMediaViewer' | 'openUserInfo'
)>;

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
  profileState,
  onProfileStateChange,
  resolvedUserId,
  chatMessages,
  isSearchTypeEmpty,
  hasMembersTab,
  groupChatMembers,
  usersById,
  setMessageSearchMediaType,
  searchMessages,
  openMediaViewer,
  openUserInfo,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState(0);

  const tabTitles = useMemo(() => ([
    ...(hasMembersTab ? ['Members'] : []),
    ...TAB_TITLES,
  ].slice(0, 4)), [hasMembersTab]);

  const mediaTypes = useMemo(() => ([
    ...(hasMembersTab ? ['members'] : []),
    ...MEDIA_TYPES,
  ].slice(0, 4)) as ApiMessageSearchType[], [hasMembersTab]);

  const mediaType = mediaTypes[activeTab];

  const messageIds = useMemo(
    () => (mediaType && chatMessages ? getMessageContentIds(chatMessages, mediaType).reverse() : []),
    [chatMessages, mediaType],
  );

  const memberIds = useMemo(() => {
    if (!groupChatMembers || !usersById) {
      return [];
    }

    return getSortedUserIds(groupChatMembers.map(({ user_id }) => user_id), usersById);
  }, [groupChatMembers, usersById]);

  const handleLoadMore = useCallback((loadMoreOptions) => {
    if (mediaType !== 'members') {
      searchMessages(loadMoreOptions);
    }
  }, [searchMessages, mediaType]);

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
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const chatInfoEl = container.querySelector<HTMLDivElement>('.ChatInfo');
    const chatExtraEl = container.querySelector<HTMLDivElement>('.ChatExtra');
    if (!chatInfoEl) {
      return;
    }

    let state: ProfileState = ProfileState.Profile;
    if (container.scrollTop >= (
      chatInfoEl.offsetHeight + 16 + (chatExtraEl ? chatExtraEl.offsetHeight : 0)
    )) {
      state = mediaType === 'members'
        ? ProfileState.MemberList
        : ProfileState.SharedMedia;
    }

    onProfileStateChange(state);
  }, [onProfileStateChange, mediaType]);

  useEffect(() => {
    determineSharedMedia();
  }, [determineSharedMedia, mediaType]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const tabsEl = container.querySelector<HTMLDivElement>('.TabList')!;
    const chatInfoEl = container.querySelector<HTMLDivElement>('.ChatInfo');

    if (chatInfoEl && profileState === ProfileState.Profile && tabsEl.offsetTop - container.scrollTop === 0) {
      isScrollingProgrammatically = true;
      fastSmoothScroll(container, chatInfoEl, 'start', container.offsetHeight * 2);
      setTimeout(() => {
        isScrollingProgrammatically = false;
        determineSharedMedia();
      }, PROGRAMMATIC_SCROLL_TIMEOUT_MS);
    }
  }, [determineSharedMedia, profileState]);

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

  const handleSelectMedia = useCallback((messageId: number) => {
    openMediaViewer({ chatId: resolvedUserId || chatId, messageId, origin: MediaViewerOrigin.SharedMedia });
  }, [chatId, resolvedUserId, openMediaViewer]);

  const handleMemberClick = useCallback((id: number) => {
    openUserInfo({ id });
  }, [openUserInfo]);

  function renderSharedMedia() {
    return (
      <div className={`content ${mediaType}-list`}>
        {mediaType === 'media' ? (
          messageIds.map((id) => (
            <Media
              key={id}
              message={chatMessages![id]}
              onClick={handleSelectMedia}
            />
          ))
        ) : mediaType === 'documents' ? (
          messageIds.map((id) => (
            <Document key={id} message={chatMessages![id]} showTimeStamp smaller load />
          ))
        ) : mediaType === 'links' ? (
          messageIds.map((id) => (
            <WebLink
              key={id}
              message={chatMessages![id]}
            />
          ))
        ) : mediaType === 'audio' ? (
          messageIds.map((id) => (
            <Audio
              key={id}
              inSharedMedia
              message={chatMessages![id]}
              date={chatMessages![id].date}
            />
          ))
        ) : mediaType === 'members' ? (
          memberIds.length
            ? memberIds.map((id) => (
              <div key={id} className="chat-item-clickable" onClick={() => handleMemberClick(id)}>
                <PrivateChatInfo userId={id} forceShowSelf />
                <RippleEffect />
              </div>
            ))
            : <Loading />
        ) : null}
      </div>
    );
  }

  return (
    <InfiniteScroll
      ref={containerRef}
      className="Profile custom-scroll"
      items={mediaType === 'members' ? memberIds : messageIds}
      preloadBackwards={SHARED_MEDIA_SLICE}
      onLoadMore={handleLoadMore}
      onScroll={handleScroll}
    >
      {resolvedUserId ? [
        <PrivateChatInfo
          userId={resolvedUserId}
          avatarSize="jumbo"
          forceShowSelf={resolvedUserId !== chatId}
          showFullInfo
        />,
        <UserExtra userId={resolvedUserId} forceShowSelf={resolvedUserId !== chatId} />,
      ] : [
        <GroupChatInfo chatId={chatId} avatarSize="jumbo" showFullInfo />,
        <GroupExtra chatId={chatId} />,
      ]}
      <div className="shared-media">
        <Transition
          name="slide"
          activeKey={activeTab}
          renderCount={tabTitles.length}
          shouldRestoreHeight
          onStart={handleTransitionStart}
          onStop={handleTransitionStop}
        >
          {renderSharedMedia}
        </Transition>
        <TabList activeTab={activeTab} tabs={tabTitles} onSwitchTab={setActiveTab} />
      </div>
    </InfiniteScroll>
  );
};

export default withGlobal<OwnProps>(
  (global, { chatId, userId }): StateProps => {
    const chat = selectChat(global, chatId);
    const chatMessages = selectChatMessages(global, userId || chatId);
    const { currentType: searchType } = global.messageSearch.byChatId[chatId] || {};
    const { byId: usersById } = global.users;

    const hasMembersTab = !userId && chat && isChatBasicGroup(chat);
    const groupChatMembers = chat && chat.full_info && chat.full_info.members;

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
      hasMembersTab,
      ...(hasMembersTab && groupChatMembers && {
        groupChatMembers,
        usersById,
      }),
    };
  },
  (setGlobal, actions): DispatchProps => {
    const {
      setMessageSearchMediaType, searchMessages, openMediaViewer, openUserInfo,
    } = actions;
    return {
      setMessageSearchMediaType, searchMessages, openMediaViewer, openUserInfo,
    };
  },
)(Profile);
