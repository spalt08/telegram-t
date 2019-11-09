import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiUser, ApiPrivateChat } from '../../../../modules/tdlib/types';
import { selectChat, selectUser } from '../../../../modules/tdlib/selectors';
import { getPrivateChatUserId, getUserFullName, getUserStatus } from '../../../../modules/tdlib/helpers';
import Avatar from '../../../../components/Avatar';

type IProps = {
  chatId: number;
  chat: ApiPrivateChat;
  user: ApiUser;
};

const DialogHeader: FC<IProps> = ({ user}) => {
  return (
    <div className="DialogHeader">
      <Avatar size="medium" user={user} />
      <div>
        <div className="title">{getUserFullName(user)}</div>
        <div className="status">{getUserStatus(user)}</div>
      </div>
    </div>
  );
};

export default withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId) as ApiPrivateChat;
    const userId = getPrivateChatUserId(chat);
    const user = selectUser(global, userId);

    return {
      chat,
      user,
    };
  },
)(DialogHeader);
