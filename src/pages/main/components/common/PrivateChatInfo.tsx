import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiUser } from '../../../../api/types';
import { selectUser } from '../../../../modules/selectors';
import { getUserFullName, getUserStatus, isUserOnline } from '../../../../modules/helpers';
import Avatar from '../../../../components/Avatar';

type IProps = {
  userId: number;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
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
  (global, { userId }: IProps) => {
    const user = selectUser(global, userId);

    return { user };
  },
)(PrivateChatInfo);
