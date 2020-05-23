import React, {
  FC, useEffect, useCallback, useRef, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiUser } from '../../api/types';

import { getUserFirstName, isChatPrivate } from '../../modules/helpers';
import { throttle } from '../../util/schedulers';
import { pick } from '../../util/iteratees';

import Avatar from '../common/Avatar';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';

export type OwnProps = {
  onReset: () => void;
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
  onReset, loadTopUsers, loadContactList, openChat, addRecentlyFoundChatId,
}) => {
  const topUsersRef = useRef<HTMLDivElement>();

  // Due to the parent Transition, this component never gets unmounted,
  // that's why we use throttled API call on every update.
  useEffect(() => {
    runThrottled(() => {
      loadTopUsers();
      // Loading full contact list for quick local search before user enters the query
      loadContactList();
    });
  }, [loadTopUsers, loadContactList]);

  useEffect(() => {
    if (!topUsers) {
      return undefined;
    }

    const topUsersEl = topUsersRef.current!;

    function scrollFooter(e: WheelEvent) {
      topUsersEl.scrollLeft += e.deltaY / 3;
    }

    topUsersEl.addEventListener('wheel', scrollFooter, { passive: true });

    return () => {
      topUsersEl.removeEventListener('wheel', scrollFooter);
    };
  }, [topUsers]);

  const handleClick = useCallback(
    (id: number) => {
      openChat({ id });
      onReset();
      setTimeout(() => {
        addRecentlyFoundChatId({ id });
      }, SEARCH_CLOSE_TIMEOUT_MS);
    },
    [openChat, addRecentlyFoundChatId, onReset],
  );

  return (
    <div className="LeftRecent custom-scroll">
      {topUsers && (
        <div className="search-section">
          <h3 className="section-heading">People</h3>
          <div ref={topUsersRef} className="top-peers">
            {topUsers.map((user) => (
              <div className="top-peer-item" onClick={() => handleClick(user.id)}>
                <Avatar user={user} />
                <div className="top-peer-name">{getUserFirstName(user)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {recentlyFoundChatIds && (
        <div className="search-section">
          <h3 className="section-heading">Recent</h3>
          {recentlyFoundChatIds.map((id) => (
            <div className="chat-item-clickable search-result" onClick={() => handleClick(id)}>
              {isChatPrivate(id) ? (
                <PrivateChatInfo userId={id} />
              ) : (
                <GroupChatInfo chatId={id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { users: topUsers } = global.topPeers;
    const { recentlyFoundChatIds } = global.globalSearch;

    return {
      topUsers,
      recentlyFoundChatIds,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'loadTopUsers',
    'loadContactList',
    'openChat',
    'addRecentlyFoundChatId',
  ]),
)(LeftRecent));
