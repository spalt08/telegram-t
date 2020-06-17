import React, {
  FC, useEffect, useCallback, useRef, memo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiUser } from '../../../api/types';

import { getUserFirstName } from '../../../modules/helpers';
import renderText from '../../common/helpers/renderText';
import { throttle } from '../../../util/schedulers';
import { pick } from '../../../util/iteratees';
import useHorizontalScroll from '../../../hooks/useHorizontalScroll';

import Avatar from '../../common/Avatar';
import LeftSearchResultChat from './LeftSearchResultChat';

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

  useHorizontalScroll(topUsersRef.current, !topUsers);

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
          <div ref={topUsersRef} className="top-peers no-selection">
            {topUsers.map((user) => (
              <div className="top-peer-item" onClick={() => handleClick(user.id)}>
                <Avatar user={user} />
                <div className="top-peer-name">{renderText(getUserFirstName(user)!)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {recentlyFoundChatIds && (
        <div className="search-section">
          <h3 className="section-heading">Recent</h3>
          {recentlyFoundChatIds.map((id) => (
            <LeftSearchResultChat
              chatId={id}
              onClick={() => handleClick(id)}
            />
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
