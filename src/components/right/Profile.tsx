import React, {
  FC, useCallback, useEffect, useMemo, useRef, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiMessage, ApiMessageSearchType, ApiPrivateChat } from '../../api/types';
import { GlobalActions } from '../../global/types';

import { getMessageContentIds, getPrivateChatUserId } from '../../modules/helpers';
import { selectChat, selectChatMessages } from '../../modules/selectors';

import Transition from '../ui/Transition';
import InfiniteScroll from '../ui/InfiniteScroll';
import TabList from '../ui/TabList';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import UserExtra from './UserExtra';
import GroupExtra from './ChatExtra';
import Media from './sharedMedia/Media';
import Document from './sharedMedia/Document';
// TODO @refactoring Move to `components/common`.
import WebPage from '../middle/message/WebPage';
import Audio from '../middle/message/Audio';

import './Profile.scss';

type IProps = {
  chatId: number;
  userId?: number;
  resolvedUserId?: number;
  chatMessages: Record<number, ApiMessage>;
} & Pick<GlobalActions, 'setMessageSearchMediaType' | 'searchMessages' | 'openMediaViewer'>;

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

const Profile: FC<IProps> = ({
  chatId,
  resolvedUserId,
  chatMessages,
  setMessageSearchMediaType,
  searchMessages,
  openMediaViewer,
}) => {
  const containerRef = useRef<HTMLDivElement>();

  const [activeTab, setActiveTab] = useState(0);
  const [mediaType, setMediaType] = useState<ApiMessageSearchType>();

  const messageIds = useMemo(
    () => (mediaType && chatMessages ? getMessageContentIds(chatMessages, mediaType).reverse() : []),
    [chatMessages, mediaType],
  );

  // Async rendering.
  useEffect(() => {
    setMediaType(MEDIA_TYPES[activeTab]);
  }, [activeTab]);

  useEffect(() => {
    setMessageSearchMediaType({ mediaType });
  }, [mediaType, setMessageSearchMediaType]);

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

  return (
    <InfiniteScroll
      ref={containerRef}
      className="Profile custom-scroll"
      items={messageIds}
      onLoadMore={searchMessages}
    >
      {resolvedUserId ? [
        <PrivateChatInfo userId={resolvedUserId} avatarSize="jumbo" />,
        <UserExtra userId={resolvedUserId} />,
      ] : [
        <GroupChatInfo chatId={chatId} avatarSize="jumbo" />,
        <GroupExtra chatId={chatId} />,
      ]}
      <div className="shared-media">
        <Transition activeKey={activeTab} name="slide" onStart={handleTransitionStart} onStop={handleTransitionStop}>
          {() => (
            <div className={`content ${mediaType}-list`}>
              {mediaType === 'media' ? (
                messageIds.map((id: number) => (
                  <Media
                    key={id}
                    message={chatMessages[id]}
                    onClick={handleSelectMedia}
                  />
                ))
              ) : mediaType === 'documents' ? (
                messageIds.map((id: number) => (
                  <Document key={id} message={chatMessages[id]} />
                ))
              ) : mediaType === 'links' ? (
                messageIds.map((id: number) => (
                  <WebPage
                    key={id}
                    inSharedMedia
                    message={chatMessages[id]}
                    load
                  />
                ))
              ) : mediaType === 'audio' ? (
                messageIds.map((id: number) => (
                  <Audio
                    key={id}
                    inSharedMedia
                    message={chatMessages[id]}
                    date={chatMessages[id].date}
                  />
                ))
              ) : null}
            </div>
          )}
        </Transition>
        <TabList activeTab={activeTab} tabs={TAB_TITLES} onSwitchTab={setActiveTab} />
      </div>
    </InfiniteScroll>
  );
};

export default withGlobal(
  (global, { chatId, userId }: IProps) => {
    const chatMessages = selectChatMessages(global, userId || chatId);

    let resolvedUserId;
    if (userId) {
      resolvedUserId = userId;
    } else {
      const chat = selectChat(global, chatId) as ApiPrivateChat | undefined;
      resolvedUserId = chat && getPrivateChatUserId(chat);
    }

    return {
      resolvedUserId,
      chatMessages,
    };
  },
  (setGlobal, actions) => {
    const { setMessageSearchMediaType, searchMessages, openMediaViewer } = actions;
    return { setMessageSearchMediaType, searchMessages, openMediaViewer };
  },
)(Profile);
