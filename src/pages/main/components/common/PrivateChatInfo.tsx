import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiUser, ApiPrivateChat } from '../../../../api/tdlib/types';
import { selectChat, selectUser } from '../../../../modules/selectors';
import {
  getPrivateChatUserId, getUserFullName, getUserStatus, isUserOnline,
} from '../../../../modules/helpers';
import Avatar from '../../../../components/Avatar';

type IProps = {
  chatId: number;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  chat: ApiPrivateChat;
  user: ApiUser;
};

const PrivateChatInfo: FC<IProps> = ({ user, avatarSize = 'medium' }) => {
  return (
    <div className="ChatInfo">
      <Avatar size={avatarSize} user={user} />
      <div>
        <div className="title">{getUserFullName(user)}</div>
        <div className={`status ${isUserOnline(user) ? 'online' : ''}`}>{getUserStatus(user)}</div>
      </div>
    </div>
  );
};

export default withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId) as ApiPrivateChat;
    const userId = chat && getPrivateChatUserId(chat);
    const user = userId && selectUser(global, userId);

    return {
      chat,
      user,
    };
  },
)(PrivateChatInfo);
