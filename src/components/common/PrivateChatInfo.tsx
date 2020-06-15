import { MouseEvent as ReactMouseEvent } from 'react';
import React, {
  FC, useEffect, useCallback, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiUser, ApiTypingStatus } from '../../api/types';
import { GlobalActions, GlobalState } from '../../global/types';
import { MediaViewerOrigin } from '../../types';

import { selectUser } from '../../modules/selectors';
import { getUserFullName, getUserStatus, isUserOnline } from '../../modules/helpers';
import renderText from './helpers/renderText';
import { pick } from '../../util/iteratees';

import Avatar from './Avatar';
import VerifiedIcon from './VerifiedIcon';
import TypingStatus from './TypingStatus';

type OwnProps = {
  userId: number;
  typingStatus?: ApiTypingStatus;
  avatarSize?: 'tiny' | 'small' | 'medium' | 'large' | 'jumbo';
  forceShowSelf?: boolean;
  showHandle?: boolean;
  showFullInfo?: boolean;
  noStatusOrTyping?: boolean;
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
  noStatusOrTyping,
  loadFullUser,
  openMediaViewer,
}) => {
  const { id: userId, isSelf } = user || {};
  const fullName = getUserFullName(user);

  useEffect(() => {
    // `Saved Messages` is the only private chat that supports pinned messages.
    // We need to call for `loadFullUser` to get pinned message ID.
    if (showFullInfo && lastSyncTime && userId && isSelf) {
      loadFullUser({ userId });
    }
  }, [isSelf, userId, loadFullUser, lastSyncTime, showFullInfo]);

  const handleAvatarViewerOpen = useCallback((e: ReactMouseEvent<HTMLDivElement, MouseEvent>, hasPhoto: boolean) => {
    if (user && hasPhoto) {
      e.stopPropagation();
      openMediaViewer({
        avatarOwnerId: user.id,
        origin: avatarSize === 'jumbo' ? MediaViewerOrigin.ProfileAvatar : MediaViewerOrigin.MiddleHeaderAvatar,
      });
    }
  }, [user, avatarSize, openMediaViewer]);

  if (!user) {
    return undefined;
  }

  function renderStatusOrTyping() {
    if (!user) {
      return undefined;
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
      <div className="info">
        {isSavedMessages ? (
          <div className="title">Saved Messages</div>
        ) : (
          <div className="title">
            {fullName && renderText(fullName)}
            {user && user.isVerified && <VerifiedIcon />}
          </div>
        )}
        {!isSavedMessages && !noStatusOrTyping && renderStatusOrTyping()}
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { userId, forceShowSelf }): StateProps => {
    const { lastSyncTime } = global;
    const user = selectUser(global, userId);

    return {
      lastSyncTime,
      user,
      isSavedMessages: !forceShowSelf && user && user.isSelf,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadFullUser', 'openMediaViewer']),
)(PrivateChatInfo));
