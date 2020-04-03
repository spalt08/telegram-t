import { MouseEvent as ReactMouseEvent } from 'react';
import React, { FC, useEffect, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiUser, ApiTypingStatus } from '../../api/types';
import { GlobalActions, GlobalState } from '../../global/types';
import { selectUser } from '../../modules/selectors';
import { getUserFullName, getUserStatus, isUserOnline } from '../../modules/helpers';

import Avatar from './Avatar';
import VerifiedIcon from './VerifiedIcon';
import TypingStatus from './TypingStatus';

type OwnProps = {
  userId: number;
  typingStatus?: ApiTypingStatus;
  avatarSize?: 'small' | 'medium' | 'large' | 'jumbo';
  forceShowSelf?: boolean;
  showHandle?: boolean;
  showFullInfo?: boolean;
};

type StateProps = {
  user?: ApiUser;
  isSavedMessages?: boolean;
} & Pick<GlobalState, 'lastSyncTime'>;

type DispatchProps = Pick<GlobalActions, 'loadFullUser' | 'openMediaViewer'>;

const PrivateChatInfo: FC<OwnProps & StateProps & DispatchProps> = ({
  lastSyncTime,
  user,
  typingStatus,
  avatarSize = 'medium',
  isSavedMessages,
  showHandle,
  showFullInfo,
  loadFullUser,
  openMediaViewer,
}) => {
  const { id: userId, is_self } = user || {};

  useEffect(() => {
    // `Saved Messages` is the only private chat that supports pinned messages.
    // We need to call for `loadFullUser` to get pinned message ID.
    if (showFullInfo && lastSyncTime && userId && is_self) {
      loadFullUser({ userId });
    }
  }, [is_self, userId, loadFullUser, lastSyncTime, showFullInfo]);

  const handleAvatarViewerOpen = useCallback((e: ReactMouseEvent<HTMLDivElement, MouseEvent>, hasPhoto: boolean) => {
    if (user && hasPhoto) {
      e.stopPropagation();
      openMediaViewer({ avatarOwnerId: user.id });
    }
  }, [user, openMediaViewer]);

  if (!user) {
    return null;
  }

  function renderStatusOrTyping() {
    if (!user) {
      return null;
    }

    if (typingStatus) {
      return <TypingStatus typingStatus={typingStatus} />;
    }

    return (
      <div className={`status ${isUserOnline(user) ? 'online' : ''}`}>
        {showHandle && <span className="handle">{user.username}</span>}
        <span className="user-status">{getUserStatus(user)}</span>
      </div>
    );
  }

  return (
    <div className="ChatInfo">
      <Avatar
        key={user.id}
        size={avatarSize}
        user={user}
        isSavedMessages={isSavedMessages}
        onClick={handleAvatarViewerOpen}
      />
      <div>
        {isSavedMessages ? (
          <div className="title">Saved Messages</div>
        ) : (
          <div className="title">
            {getUserFullName(user)}
            {user && user.is_verified && <VerifiedIcon />}
          </div>
        )}
        {!isSavedMessages && renderStatusOrTyping()}
      </div>
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global, { userId, forceShowSelf }): StateProps => {
    const { lastSyncTime } = global;
    const user = selectUser(global, userId);

    return {
      lastSyncTime,
      user,
      isSavedMessages: !forceShowSelf && user && user.is_self,
    };
  },
  (setGlobal, actions): DispatchProps => {
    const { loadFullUser, openMediaViewer } = actions;
    return { loadFullUser, openMediaViewer };
  },
)(PrivateChatInfo);
