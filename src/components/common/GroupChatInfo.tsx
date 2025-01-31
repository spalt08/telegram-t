import { MouseEvent as ReactMouseEvent } from 'react';
import React, {
  FC, useEffect, useCallback, memo,
} from '../../lib/teact/teact';
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
import renderText from './helpers/renderText';
import { pick } from '../../util/iteratees';
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
  showChatType?: boolean;
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
  showChatType,
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
    return undefined;
  }

  function renderStatusOrTyping() {
    if (!chat) {
      return undefined;
    }

    if (typingStatus) {
      return <TypingStatus typingStatus={typingStatus} />;
    }

    if (showChatType) {
      return (
        <div className="status">{getChatTypeString(chat)}</div>
      );
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
      <div className="info">
        <div className="title">
          <h3>{renderText(getChatTitle(chat))}</h3>
          {chat.isVerified && <VerifiedIcon />}
        </div>
        {renderStatusOrTyping()}
      </div>
    </div>
  );
};

function getGroupStatus(chat: ApiChat) {
  const chatTypeString = getChatTypeString(chat);
  const { membersCount } = chat;

  if (chat.isRestricted) {
    return chatTypeString === 'Channel' ? 'channel is inaccessible' : 'group is inaccessible';
  }

  const memberTypeString = chatTypeString === 'Channel' ? 'subscriber' : 'member';
  const pluralSuffix = membersCount !== 1 ? 's' : '';

  return membersCount
    ? `${formatInteger(membersCount)} ${memberTypeString}${pluralSuffix}`
    : chatTypeString;
}

export default memo(withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const { lastSyncTime } = global;
    const chat = selectChat(global, chatId);
    const onlineCount = chat ? selectChatOnlineCount(global, chat) : undefined;

    return { lastSyncTime, chat, onlineCount };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadFullChat', 'loadSuperGroupOnlines', 'openMediaViewer']),
)(GroupChatInfo));
