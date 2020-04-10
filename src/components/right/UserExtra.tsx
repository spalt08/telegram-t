import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiUser } from '../../api/types';
import { GlobalActions, GlobalState } from '../../global/types';
import { selectUser } from '../../modules/selectors';
import { formatPhoneNumberWithCode } from '../../util/phoneNumber';

type OwnProps = {
  userId: number;
  forceShowSelf?: boolean;
};

type StateProps = {
  user?: ApiUser;
} & Pick<GlobalState, 'lastSyncTime'>;

type DispatchProps = Pick<GlobalActions, 'loadFullUser'>;

const UserExtra: FC<OwnProps & StateProps & DispatchProps> = ({
  lastSyncTime, user, forceShowSelf, loadFullUser,
}) => {
  const {
    id: userId,
    full_info,
    username,
    phone_number,
    is_self,
  } = user || {};

  useEffect(() => {
    if (lastSyncTime && !is_self) {
      loadFullUser({ userId });
    }
  }, [is_self, loadFullUser, userId, lastSyncTime]);

  if (!user || (is_self && !forceShowSelf)) {
    return null;
  }

  const bio = full_info && full_info.bio;
  const formattedNumber = phone_number && formatPhoneNumberWithCode(phone_number);

  return (
    <div className="ChatExtra">
      {bio && !!bio.length && (
        <div className="item">
          <i className="icon-info" />
          <div>
            <p className="title">{bio}</p>
            <p className="subtitle">Bio</p>
          </div>
        </div>
      )}
      {username && !!username.length && (
        <div className="item">
          <i className="icon-username" />
          <div>
            <p className="title">{username}</p>
            <p className="subtitle">Username</p>
          </div>
        </div>
      )}
      {formattedNumber && !!formattedNumber.length && (
        <div className="item">
          <i className="icon-phone" />
          <div>
            <p className="title">{formattedNumber}</p>
            <p className="subtitle">Phone</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global, { userId }): StateProps => {
    const { lastSyncTime } = global;
    const user = selectUser(global, userId);

    return { lastSyncTime, user };
  },
  (setGlobal, actions): DispatchProps => {
    const { loadFullUser } = actions;
    return { loadFullUser };
  },
)(UserExtra);
