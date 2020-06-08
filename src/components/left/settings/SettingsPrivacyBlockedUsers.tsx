import React, { FC, useMemo, memo } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiUser } from '../../../api/types';

import { formatPhoneNumberWithCode } from '../../../util/phoneNumber';

import ListItem from '../../ui/ListItem';
import FloatingActionButton from '../../ui/FloatingActionButton';
import Avatar from '../../common/Avatar';

type StateProps = {
  usersById: Record<number, ApiUser>;
};

const SettingsPrivacyBlockedUsers: FC<StateProps> = ({
  usersById,
}) => {
  const mockupUsers = useMemo(() => {
    return Object.values(usersById)
      .filter((user) => !user.isSelf && !!user.lastName && !!user.phoneNumber)
      .slice(0, 6);
  }, [usersById]);

  function renderBlockedUser(user: ApiUser) {
    const { firstName, lastName, phoneNumber } = user;

    return (
      <ListItem
        className="blocked-list-item not-implemented"
        ripple
        narrow
        contextActions={[{
          title: 'Unblock',
          icon: 'unlock',
        }]}
      >
        <Avatar size="medium" user={user} />
        <div className="contact-info">
          <div className="contact-name">{firstName} {lastName}</div>
          {phoneNumber && (
            <div className="contact-phone">{formatPhoneNumberWithCode(phoneNumber)}</div>
          )}
        </div>
      </ListItem>
    );
  }

  return (
    <div className="settings-fab-wrapper">
      <div className="settings-content custom-scroll">
        <div className="settings-item">
          <p className="settings-item-description-larger mt-0 mb-4">
            Blocked users will not be able to contact you and will not see your Last Seen time.
          </p>

          {mockupUsers.map(renderBlockedUser)}
        </div>
      </div>

      <FloatingActionButton
        show
        onClick={() => {}}
      >
        <i className="icon-add" />
      </FloatingActionButton>
    </div>
  );
};


export default memo(withGlobal(
  (global): StateProps => {
    const { byId: usersById } = global.users;

    return {
      usersById,
    };
  },
)(SettingsPrivacyBlockedUsers));
