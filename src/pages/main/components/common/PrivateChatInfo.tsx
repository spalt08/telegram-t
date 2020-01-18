import React, { FC, useEffect } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiUser } from '../../../../api/types';
import { selectUser } from '../../../../modules/selectors';
import { getUserFullName, getUserStatus, isUserOnline } from '../../../../modules/helpers';
import { GlobalActions, GlobalState } from '../../../../store/types';
import Avatar from '../../../../components/Avatar';
import VerifiedIcon from '../../../../components/VerifiedIcon';

type IProps = Pick<GlobalState, 'lastSyncTime'> & Pick<GlobalActions, 'loadFullUser'> & {
  userId: number;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  user: ApiUser;
};

const PrivateChatInfo: FC<IProps> = ({
  lastSyncTime, user, avatarSize = 'medium', loadFullUser,
}) => {
  useEffect(() => {
    if (lastSyncTime && user.is_self) {
      loadFullUser({ userId: user.id });
    }
  }, [user.is_self, loadFullUser, user.id, lastSyncTime]);

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
    const { lastSyncTime } = global;
    const user = selectUser(global, userId);

    return { lastSyncTime, user };
  },
  (setGlobal, actions) => {
    const { loadFullUser } = actions;
    return { loadFullUser };
  },
)(PrivateChatInfo);
