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

import PrivateChatInfo from '../../common/PrivateChatInfo';
import Loading from '../../ui/Loading';
import ListItem from '../../ui/ListItem';

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

  const displayedIds = useMemo(() => {
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

  if (!displayedIds) {
    return <Loading />;
  }

  return (
    <div className="ContactList custom-scroll">
      {!displayedIds.length && !!filter.length && (
        <p className="no-results">No contacts matched your search.</p>
      )}
      {displayedIds.map((id) => (
        <ListItem
          key={id}
          className="chat-item-clickable"
          onClick={() => handleClick(id)}
          ripple
        >
          <PrivateChatInfo userId={id} forceShowSelf />
        </ListItem>
      ))}
    </div>
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
