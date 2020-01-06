import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiUser } from '../../../../api/types';
import { GlobalActions } from '../../../../store/types';
import { selectUser } from '../../../../modules/selectors';
import { formatPhoneNumberWithCode } from '../../../../util/formatPhoneNumber';

type IProps = Pick<GlobalActions, 'loadFullUser'> & {
  userId: number;
  user: ApiUser;
};

const UserExtra: FC<IProps> = ({ user, loadFullUser }) => {
  const {
    full_info,
    username,
    phone_number,
    is_self,
  } = user;
  if (is_self) {
    return null;
  }

  if (!full_info) {
    loadFullUser({ userId: user.id });
  }

  const bio = full_info && full_info.bio;

  const formattedNumber = formatPhoneNumberWithCode(phone_number);

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
      {!!username.length && (
        <div className="item">
          <i className="icon-username" />
          <div>
            <p className="title">{username}</p>
            <p className="subtitle">Username</p>
          </div>
        </div>
      )}
      {!!phone_number.length && (
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

export default withGlobal(
  (global, { userId }: IProps) => {
    const user = selectUser(global, userId);

    return { user };
  },
  (setGlobal, actions) => {
    const { loadFullUser } = actions;
    return { loadFullUser };
  },
)(UserExtra);
