import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiUser, ApiTypingStatus } from '../../api/types';
import { GlobalActions, GlobalState } from '../../global/types';
import { selectUser } from '../../modules/selectors';
import { getUserFullName, getUserStatus, isUserOnline } from '../../modules/helpers';

import Avatar from './Avatar';
import VerifiedIcon from './VerifiedIcon';
import TypingStatus from './TypingStatus';

type IProps = Pick<GlobalState, 'lastSyncTime'> & Pick<GlobalActions, 'loadFullUser'> & {
  userId: number;
  typingStatus?: ApiTypingStatus;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  isSavedMessages: boolean;
  user: ApiUser;
};

const PrivateChatInfo: FC<IProps> = ({
  lastSyncTime, user, typingStatus, avatarSize = 'medium', isSavedMessages, loadFullUser,
}) => {
  useEffect(() => {
    if (lastSyncTime && user.is_self) {
      loadFullUser({ userId: user.id });
    }
  }, [user.is_self, loadFullUser, user.id, lastSyncTime]);

  function renderStatusOrTyping() {
    if (typingStatus) {
      return <TypingStatus typingStatus={typingStatus} />;
    }

    return (
      <div className={`status ${isUserOnline(user) ? 'online' : ''}`}>
        {getUserStatus(user)}
      </div>
    );
  }

  return (
    <div className="ChatInfo">
      <Avatar key={user.id} size={avatarSize} user={user} isSavedMessages={isSavedMessages} />
      <div>
        {isSavedMessages ? (
          <div className="title">Saved Messages</div>
        ) : (
          <div className="title">
            {getUserFullName(user)}
            {user.is_verified && <VerifiedIcon />}
          </div>
        )}
        {!isSavedMessages && renderStatusOrTyping()}
      </div>
    </div>
  );
};

export default withGlobal(
  (global, { userId }: IProps) => {
    const { lastSyncTime, chats } = global;
    const user = selectUser(global, userId);

    return {
      lastSyncTime,
      user,
      isSavedMessages: user && user.is_self && user.id === chats.selectedId,
    };
  },
  (setGlobal, actions) => {
    const { loadFullUser } = actions;
    return { loadFullUser };
  },
)(PrivateChatInfo);
