import React, {
  FC, useEffect, useCallback,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiUser } from '../../api/types';

import { getUserFirstName, isChatPrivate } from '../../modules/helpers';
import { throttle } from '../../util/schedulers';

import Avatar from '../common/Avatar';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import RippleEffect from '../ui/RippleEffect';

type OwnProps = {
  onSearchClose: () => void;
};

type StateProps = {
  topUsers?: ApiUser[];
  recentlyFoundChatIds?: number[];
};

type DispatchProps = Pick<GlobalActions, 'loadTopUsers' | 'loadContactList' | 'openChat' | 'addRecentlyFoundChatId'>;

const SEARCH_CLOSE_TIMEOUT_MS = 250;
const runThrottled = throttle((cb) => cb(), 60000, true);

const LeftRecent: FC<OwnProps & StateProps & DispatchProps> = ({
  topUsers, recentlyFoundChatIds,
  onSearchClose, loadTopUsers, loadContactList, openChat, addRecentlyFoundChatId,
}) => {
  useEffect(() => {
    runThrottled(() => {
      loadTopUsers();
      // Loading full contact list for quick local search before user enters the query
      loadContactList();
    });
  }, [loadTopUsers, loadContactList]);

  const handleClick = useCallback(
    (id: number) => {
      openChat({ id });
      onSearchClose();
      setTimeout(() => {
        addRecentlyFoundChatId({ id });
      }, SEARCH_CLOSE_TIMEOUT_MS);
    },
    [openChat, addRecentlyFoundChatId, onSearchClose],
  );

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.scrollLeft += e.deltaY / 3;
  }, []);

  return (
    <div className="LeftRecent custom-scroll">
      {topUsers && (
        <div className="search-section">
          <h3 className="section-heading">People</h3>
          <div className="top-peers" onWheel={handleWheel}>
            {topUsers.map((user) => (
              <div className="top-peer-item" onClick={() => handleClick(user.id)}>
                <Avatar user={user} />
                <div className="top-peer-name">{getUserFirstName(user)}</div>
                <RippleEffect />
              </div>
            ))}
          </div>
        </div>
      )}
      {recentlyFoundChatIds && (
        <div className="search-section">
          <h3 className="section-heading">Recent</h3>
          {recentlyFoundChatIds.map((id) => (
            <div className="search-result" onClick={() => handleClick(id)}>
              {isChatPrivate(id) ? (
                <PrivateChatInfo userId={id} />
              ) : (
                <GroupChatInfo chatId={id} />
              )}
              <RippleEffect />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global): StateProps => {
    const { users: topUsers } = global.topPeers;
    const { recentlyFoundChatIds } = global.globalSearch;

    return {
      topUsers,
      recentlyFoundChatIds,
    };
  },
  (setGlobal, actions): DispatchProps => {
    const {
      loadTopUsers, loadContactList, openChat, addRecentlyFoundChatId,
    } = actions;
    return {
      loadTopUsers, loadContactList, openChat, addRecentlyFoundChatId,
    };
  },
)(LeftRecent);
