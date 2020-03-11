import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat, ApiTypingStatus } from '../../api/types';
import { GlobalActions, GlobalState } from '../../global/types';
import { getChatTypeString, getChatTitle, isChatSuperGroup } from '../../modules/helpers';
import { selectChat, selectChatOnlineCount } from '../../modules/selectors';
import { formatInteger } from '../../util/textFormat';

import Avatar from './Avatar';
import VerifiedIcon from './VerifiedIcon';
import TypingStatus from './TypingStatus';

type IProps = Pick<GlobalState, 'lastSyncTime'> & Pick<GlobalActions, 'loadFullChat' | 'loadSuperGroupOnlines'> & {
  chatId: number;
  typingStatus?: ApiTypingStatus;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  showHandle?: boolean;
  showFullInfo?: boolean;
  chat?: ApiChat;
  onlineCount?: number;
};

const GroupChatInfo: FC<IProps> = ({
  typingStatus,
  avatarSize = 'medium',
  showHandle,
  showFullInfo,
  lastSyncTime,
  chat,
  onlineCount,
  loadFullChat,
  loadSuperGroupOnlines,
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

  return (
    <div className="ChatInfo">
      <Avatar key={chat.id} size={avatarSize} chat={chat} />
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

export default withGlobal(
  (global, { chatId }: IProps) => {
    const { lastSyncTime } = global;
    const chat = selectChat(global, chatId);
    const onlineCount = chat ? selectChatOnlineCount(global, chat) : undefined;

    return { lastSyncTime, chat, onlineCount };
  },
  (setGlobal, actions) => {
    const { loadFullChat, loadSuperGroupOnlines } = actions;
    return { loadFullChat, loadSuperGroupOnlines };
  },
)(GroupChatInfo);
