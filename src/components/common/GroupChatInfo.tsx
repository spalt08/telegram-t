import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat } from '../../api/types';
import { GlobalActions, GlobalState } from '../../global/types';
import { getChatTypeString, getChatTitle, isChatSuperGroup } from '../../modules/helpers';
import { selectChat, selectChatOnlineCount } from '../../modules/selectors';
import { formatInteger } from '../../util/textFormat';

import Avatar from './Avatar';
import VerifiedIcon from './VerifiedIcon';

type IProps = Pick<GlobalState, 'lastSyncTime'> & Pick<GlobalActions, 'loadFullChat' | 'loadSuperGroupOnlines'> & {
  chatId: number;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  chat: ApiChat;
  onlineCount?: number;
};

const GroupChatInfo: FC<IProps> = ({
  avatarSize = 'medium',
  lastSyncTime,
  chat,
  onlineCount,
  loadFullChat,
  loadSuperGroupOnlines,
}) => {
  const isSuperGroup = isChatSuperGroup(chat);

  useEffect(() => {
    if (lastSyncTime) {
      loadFullChat({ chatId: chat.id });

      if (isSuperGroup) {
        loadSuperGroupOnlines({ chatId: chat.id });
      }
    }
  }, [chat.id, lastSyncTime, loadFullChat, isSuperGroup, loadSuperGroupOnlines]);

  const groupStatus = getGroupStatus(chat);
  const onlineStatus = onlineCount ? `, ${formatInteger(onlineCount)} online` : '';

  return (
    <div className="ChatInfo">
      <Avatar key={chat.id} size={avatarSize} chat={chat} />
      <div>
        <div className="title">
          {getChatTitle(chat)}
          {chat.is_verified && <VerifiedIcon />}
        </div>
        <div className="status">
          {groupStatus}
          {onlineStatus}
        </div>
      </div>
    </div>
  );
};

function getGroupStatus(chat: ApiChat) {
  const chatTypeString = getChatTypeString(chat);
  if (!chat.full_info) {
    return chatTypeString;
  }

  const { member_count } = chat.full_info;

  return member_count
    ? `${formatInteger(member_count)} ${chatTypeString === 'Channel' ? 'subscribers' : 'members'}`
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
