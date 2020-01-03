import React, { FC, memo } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiChat } from '../../../../api/types';
import { GlobalActions } from '../../../../store/types';
import { getChatTypeString, getChatTitle } from '../../../../modules/helpers';
import Avatar from '../../../../components/Avatar';
import { selectChat } from '../../../../modules/selectors';

type IProps = Pick<GlobalActions, 'loadFullChat' | 'loadChatOnlines'> & {
  chatId: number;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  chat: ApiChat;
};

const GroupChatInfo: FC<IProps> = ({
  chat,
  avatarSize = 'medium',
  loadFullChat,
  loadChatOnlines,
}) => {
  if (!chat.full_info) {
    loadFullChat({ chatId: chat.id });
  }
  if (chat.online_count === undefined) {
    loadChatOnlines({ chatId: chat.id });
  }

  const groupStatus = getGroupStatus(chat);
  const onlineStatus = chat.online_count ? `, ${chat.online_count} online` : '';

  return (
    <div className="ChatInfo">
      <Avatar size={avatarSize} chat={chat} />
      <div>
        <div className="title">{getChatTitle(chat)}</div>
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
    ? `${member_count} ${chatTypeString === 'Channel' ? 'subscribers' : 'members'}`
    : chatTypeString;
}

export default memo(withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId);

    return { chat };
  },
  (setGlobal, actions) => {
    const { loadFullChat, loadChatOnlines } = actions;
    return { loadFullChat, loadChatOnlines };
  },
)(GroupChatInfo));
