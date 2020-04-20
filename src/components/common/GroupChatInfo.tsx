import { MouseEvent as ReactMouseEvent } from 'react';
import React, { FC, useEffect, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat, ApiTypingStatus } from '../../api/types';
import { GlobalActions, GlobalState } from '../../global/types';
import { MediaViewerOrigin } from '../../types';

import {
  getChatTypeString,
  getChatTitle,
  isChatSuperGroup,
  isChatBasicGroup,
} from '../../modules/helpers';
import { selectChat, selectChatOnlineCount } from '../../modules/selectors';
import { formatInteger } from '../../util/textFormat';
import buildClassName from '../../util/buildClassName';
import { DEBUG } from '../../config';

import Avatar from './Avatar';
import VerifiedIcon from './VerifiedIcon';
import TypingStatus from './TypingStatus';

type OwnProps = {
  chatId: number;
  typingStatus?: ApiTypingStatus;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  showHandle?: boolean;
  showFullInfo?: boolean;
};

type StateProps = {
  chat?: ApiChat;
  onlineCount?: number;
} & Pick<GlobalState, 'lastSyncTime'>;

type DispatchProps = Pick<GlobalActions, 'loadFullChat' | 'loadSuperGroupOnlines' | 'openMediaViewer'>;

const GroupChatInfo: FC<OwnProps & StateProps & DispatchProps> = ({
  typingStatus,
  avatarSize = 'medium',
  showHandle,
  showFullInfo,
  lastSyncTime,
  chat,
  onlineCount,
  loadFullChat,
  loadSuperGroupOnlines,
  openMediaViewer,
}) => {
  const isSuperGroup = chat && isChatSuperGroup(chat);
  const { id: chatId } = chat || {};

  useEffect(() => {
    if (showFullInfo && lastSyncTime) {
      loadFullChat({ chatId });

      if (isSuperGroup) {
        loadSuperGroupOnlines({ chatId });
      }
    }
  }, [chatId, lastSyncTime, showFullInfo, loadFullChat, isSuperGroup, loadSuperGroupOnlines]);

  const handleAvatarViewerOpen = useCallback((e: ReactMouseEvent<HTMLDivElement, MouseEvent>, hasPhoto: boolean) => {
    if (chat && hasPhoto) {
      e.stopPropagation();
      openMediaViewer({
        avatarOwnerId: chat.id,
        origin: avatarSize === 'jumbo' ? MediaViewerOrigin.ProfileAvatar : MediaViewerOrigin.MiddleHeaderAvatar,
      });
    }
  }, [chat, avatarSize, openMediaViewer]);

  if (!chat) {
    return null;
  }

  function renderStatusOrTyping() {
    if (!chat) {
      return null;
    }

    if (typingStatus) {
      return <TypingStatus typingStatus={typingStatus} />;
    }
    const handle = showHandle ? chat.username : undefined;
    const groupStatus = getGroupStatus(chat);
    const onlineStatus = onlineCount ? `, ${formatInteger(onlineCount)} online` : undefined;

    return (
      <div className="status">
        {handle && <span className="handle">{handle}</span>}
        <span className="group-status">{groupStatus}</span>
        {onlineStatus && <span className="online-status">{onlineStatus}</span>}
      </div>
    );
  }

  const className = buildClassName(
    'ChatInfo',
    DEBUG && isChatBasicGroup(chat) && 'legacy-group-chat',
  );

  return (
    <div className={className}>
      <Avatar key={chat.id} size={avatarSize} chat={chat} onClick={handleAvatarViewerOpen} />
      <div>
        <div className="title">
          {getChatTitle(chat)}
          {chat.is_verified && <VerifiedIcon />}
        </div>
        {renderStatusOrTyping()}
      </div>
    </div>
  );
};

function getGroupStatus(chat: ApiChat) {
  const chatTypeString = getChatTypeString(chat);
  const { members_count } = chat;

  return members_count
    ? `${formatInteger(members_count)} ${chatTypeString === 'Channel' ? 'subscribers' : 'members'}`
    : chatTypeString;
}

export default withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const { lastSyncTime } = global;
    const chat = selectChat(global, chatId);
    const onlineCount = chat ? selectChatOnlineCount(global, chat) : undefined;

    return { lastSyncTime, chat, onlineCount };
  },
  (setGlobal, actions): DispatchProps => {
    const { loadFullChat, loadSuperGroupOnlines, openMediaViewer } = actions;
    return { loadFullChat, loadSuperGroupOnlines, openMediaViewer };
  },
)(GroupChatInfo);
