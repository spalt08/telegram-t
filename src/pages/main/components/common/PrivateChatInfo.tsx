import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiUser } from '../../../../api/types';
import { selectUser } from '../../../../modules/selectors';
import { getUserFullName, getUserStatus, isUserOnline } from '../../../../modules/helpers';
import { GlobalActions } from '../../../../store/types';
import Avatar from '../../../../components/Avatar';
import VerifiedIcon from '../../../../components/VerifiedIcon';

type IProps = Pick<GlobalActions, 'loadFullUser'> & {
  userId: number;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  user: ApiUser;
};

const PrivateChatInfo: FC<IProps> = ({ user, avatarSize = 'medium', loadFullUser }) => {
  if (user.is_self && !user.full_info) {
    loadFullUser({ userId: user.id });
  }

  return (
    <div className="ChatInfo">
      <Avatar size={avatarSize} user={user} isSavedMessages={user.is_self} />
      <div>
        {user.is_self ? (
          <div className="title">Saved Messages</div>
        ) : (
          <div className="title">
            {getUserFullName(user)}
            {user.is_verified && <VerifiedIcon />}
          </div>
        )}
        {!user.is_self && (
          <div className={`status ${isUserOnline(user) ? 'online' : ''}`}>{getUserStatus(user)}</div>
        )}
      </div>
    </div>
  );
};

export default withGlobal(
  (global, { userId }: IProps) => {
    const user = selectUser(global, userId);

    return { user };
  },
  (setGlobal, actions) => {
    const { loadFullUser } = actions;
    return { loadFullUser };
  },
)(PrivateChatInfo);
