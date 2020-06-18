import React, {
  FC, useEffect, useCallback, useMemo, memo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiUser } from '../../../api/types';

import { throttle } from '../../../util/schedulers';
import searchWords from '../../../util/searchWords';
import { pick } from '../../../util/iteratees';
import { getUserFullName, getSortedUserIds } from '../../../modules/helpers';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';

import PrivateChatInfo from '../../common/PrivateChatInfo';
import InfiniteScroll from '../../ui/InfiniteScroll';
import ListItem from '../../ui/ListItem';
import Loading from '../../ui/Loading';

import './ContactList.scss';

export type OwnProps = {
  filter: string;
};

type StateProps = {
  usersById: Record<number, ApiUser>;
  contactIds?: number[];
};

type DispatchProps = Pick<GlobalActions, 'loadContactList' | 'openChat'>;

const runThrottled = throttle((cb) => cb(), 60000, true);

const ContactList: FC<OwnProps & StateProps & DispatchProps> = ({
  filter, usersById, contactIds, loadContactList, openChat,
}) => {
  // Due to the parent Transition, this component never gets unmounted,
  // that's why we use throttled API call on every update.
  useEffect(() => {
    runThrottled(() => {
      loadContactList();
    });
  });

  const handleClick = useCallback(
    (id: number) => {
      openChat({ id });
    },
    [openChat],
  );

  const listIds = useMemo(() => {
    if (!contactIds) {
      return undefined;
    }

    const resultIds = filter ? contactIds.filter((id) => {
      const user = usersById[id];
      if (!user) {
        return false;
      }
      const fullName = getUserFullName(user);
      return fullName && searchWords(fullName, filter);
    }) : contactIds;

    return getSortedUserIds(resultIds, usersById);
  }, [filter, usersById, contactIds]);

  const [viewportIds, getMore] = useInfiniteScroll(undefined, listIds, Boolean(filter));

  return (
    <InfiniteScroll items={viewportIds} onLoadMore={getMore} className="ContactList custom-scroll optimized-list">
      {viewportIds && viewportIds.length ? (
        viewportIds.map((id) => (
          <ListItem
            key={id}
            className="chat-item-clickable"
            onClick={() => handleClick(id)}
            ripple
          >
            <PrivateChatInfo userId={id} forceShowSelf avatarSize="large" />
          </ListItem>
        ))
      ) : viewportIds && !viewportIds.length && Boolean(filter.length) ? (
        <p className="no-results">No contacts matched your search.</p>
      ) : (
        <Loading />
      )}
    </InfiniteScroll>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { userIds: contactIds } = global.contactList || {};
    const { byId: usersById } = global.users;

    return {
      usersById,
      contactIds,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadContactList', 'openChat']),
)(ContactList));
