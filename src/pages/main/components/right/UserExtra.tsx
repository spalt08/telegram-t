import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiUser, ApiPrivateChat } from '../../../../api/tdlib/types';
import { selectChat, selectUser } from '../../../../modules/selectors';
import { getPrivateChatUserId } from '../../../../modules/helpers';

type IProps = {
  chatId: number;
  user: ApiUser;
};

const PrivateChatInfo: FC<IProps> = ({ user }) => {
  const { bio, username, phone_number } = user;
  return (
    <div className="ChatExtra">
      {bio && !!bio.length && (
        <div className="item">
          <i className="icon-info" />
          <div>
            <p className="title">{bio}</p>
            <p className="subtitle">Bio</p>
          </div>
        </div>
      )}
      {!!username.length && (
        <div className="item">
          <i className="icon-username" />
          <div>
            <p className="title">{username}</p>
            <p className="subtitle">Username</p>
          </div>
        </div>
      )}
      {!!phone_number.length && (
        <div className="item">
          <i className="icon-phone" />
          <div>
            <p className="title">{phone_number}</p>
            <p className="subtitle">Phone</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId) as ApiPrivateChat;
    const userId = chat && getPrivateChatUserId(chat);
    const user = userId && selectUser(global, userId);

    return { user };
  },
)(PrivateChatInfo);
