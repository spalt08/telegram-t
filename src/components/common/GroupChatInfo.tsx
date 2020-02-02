import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat } from '../../api/types';
import { GlobalActions, GlobalState } from '../../store/types';
import { getChatTypeString, getChatTitle } from '../../modules/helpers';
import { selectChat } from '../../modules/selectors';
import { formatInteger } from '../../util/textFormat';

import Avatar from './Avatar';
import VerifiedIcon from './VerifiedIcon';

type IProps = Pick<GlobalState, 'lastSyncTime'> & Pick<GlobalActions, 'loadFullChat' | 'loadChatOnlines'> & {
  chatId: number;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  chat: ApiChat;
};

const GroupChatInfo: FC<IProps> = ({
  lastSyncTime,
  chat,
  avatarSize = 'medium',
  loadFullChat,
  loadChatOnlines,
}) => {
  useEffect(() => {
    if (lastSyncTime) {
      loadFullChat({ chatId: chat.id });
      loadChatOnlines({ chatId: chat.id });
    }
  }, [chat.id, loadChatOnlines, loadFullChat, lastSyncTime]);

  const groupStatus = getGroupStatus(chat);
  const onlineStatus = chat.online_count ? `, ${formatInteger(chat.online_count)} online` : '';

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

    return { lastSyncTime, chat };
  },
  (setGlobal, actions) => {
    const { loadFullChat, loadChatOnlines } = actions;
    return { loadFullChat, loadChatOnlines };
  },
)(GroupChatInfo);
