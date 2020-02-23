import React, {
  FC, useCallback, useEffect, useMemo, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiMessage, ApiPrivateChat } from '../../api/types';
import { GlobalActions } from '../../global/types';

import { getMessageContentIds, getPrivateChatUserId } from '../../modules/helpers';
import { selectChat, selectChatMessages } from '../../modules/selectors';

import Transition from '../ui/Transition';
import InfiniteScroll from '../ui/InfiniteScroll';
import TabList from '../ui/TabList';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import UserExtra from './UserExtra';
import GroupExtra from './GroupExtra';
import Media from './sharedMedia/Media';
import Document from './sharedMedia/Document';
import WebPage from '../middle/message/WebPage';
import Audio from '../middle/message/Audio';

import './RightColumnInfo.scss';

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
  'document',
  'webPage',
  'audio',
] as const;

const RightColumnInfo: FC<IProps> = ({
  chatId,
  resolvedUserId,
  chatMessages,
  setMessageSearchMediaType,
  searchMessages,
  openMediaViewer,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [mediaType, setMediaType] = useState();

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

  const handleSelectMedia = useCallback((messageId) => {
    openMediaViewer({ chatId: resolvedUserId || chatId, messageId, isReversed: true });
  }, [chatId, resolvedUserId, openMediaViewer]);

  return (
    <InfiniteScroll
      className="RightColumnInfo custom-scroll"
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
        <TabList activeTab={activeTab} tabs={TAB_TITLES} onSwitchTab={setActiveTab} />
        <Transition activeKey={activeTab} name="slide">
          {() => (
            <div className={`content ${mediaType}-list`}>
              {/* eslint-disable no-nested-ternary */}
              {mediaType === 'media' ? (
                messageIds.map((id: number) => (
                  <Media
                    key={id}
                    message={chatMessages[id]}
                    onClick={handleSelectMedia}
                  />
                ))
              ) : mediaType === 'document' ? (
                messageIds.map((id: number) => (
                  <Document key={id} message={chatMessages[id]} />
                ))
              ) : mediaType === 'webPage' ? (
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
              {/* eslint-enable no-nested-ternary */}
            </div>
          )}
        </Transition>
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
)(RightColumnInfo);
