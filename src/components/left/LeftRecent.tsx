import React, {
  FC, useState, useEffect, useRef, useCallback,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiUser } from '../../api/types';

import { getUserFirstName } from '../../modules/helpers';
import { throttle } from '../../util/schedulers';

import Loading from '../ui/Loading';
import Avatar from '../common/Avatar';

type IProps = {
  topUsers?: ApiUser[];
  onSearchClose: () => void;
} & Pick<GlobalActions, 'loadTopUsers' | 'openChat'>;

const runThrottledForTopPeople = throttle((cb) => cb(), 60000, true);

const LeftRecent: FC<IProps> = ({
  topUsers, onSearchClose, loadTopUsers, openChat,
}) => {
  const topPeopleListRef = useRef<HTMLDivElement>();
  const [isLoading, setIsLoading] = useState(!topUsers);

  useEffect(() => {
    runThrottledForTopPeople(loadTopUsers);
  }, [loadTopUsers]);

  useEffect(() => {
    if (topUsers) {
      setIsLoading(false);
    }
  }, [topUsers]);

  useEffect(() => {
    if (isLoading) {
      return undefined;
    }

    const list = topPeopleListRef.current!;

    function scrollList(e: WheelEvent) {
      list.scrollLeft += e.deltaY / 3;
    }

    list.addEventListener('wheel', scrollList, { passive: true });

    return () => {
      list.removeEventListener('wheel', scrollList);
    };
  }, [isLoading]);

  const handleClick = useCallback(
    (id: number) => {
      openChat({ id });
      onSearchClose();
    },
    [openChat, onSearchClose],
  );

  if (isLoading) {
    return (
      <div className="LeftRecent">
        <Loading />
      </div>
    );
  }

  return (
    <div className="LeftRecent">
      {topUsers && (
        <div className="search-section">
          <h3 className="section-heading">People</h3>
          <div ref={topPeopleListRef} className="top-peers">
            {topUsers.map((user) => (
              <div className="top-peer-item" onClick={() => handleClick(user.id)}>
                <Avatar user={user} />
                <div className="top-peer-name">{getUserFirstName(user)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="search-section">
        <h3 className="section-heading">Recent</h3>
      </div>
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { users: topUsers } = global.topPeers;
    return { topUsers };
  },
  (setGlobal, actions) => {
    const { loadTopUsers, openChat } = actions;
    return { loadTopUsers, openChat };
  },
)(LeftRecent);
