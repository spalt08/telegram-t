import React, {
  FC, useEffect, useCallback, useMemo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiUser } from '../../api/types';

import { throttle } from '../../util/schedulers';
import searchWords from '../../util/searchWords';
import { getUserFullName, getSortedUserIds } from '../../modules/helpers';

import PrivateChatInfo from '../common/PrivateChatInfo';
import RippleEffect from '../ui/RippleEffect';
import Loading from '../ui/Loading';

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
        <div key={id} className="chat-item-clickable" onClick={() => handleClick(id)}>
          <PrivateChatInfo userId={id} forceShowSelf />
          <RippleEffect />
        </div>
      ))}
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global): StateProps => {
    const { userIds: contactIds } = global.contactList || {};
    const { byId: usersById } = global.users;

    return {
      usersById,
      contactIds,
    };
  },
  (setGlobal, actions): DispatchProps => {
    const { loadContactList, openChat } = actions;
    return { loadContactList, openChat };
  },
)(ContactList);
