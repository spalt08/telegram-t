import React, { FC, useCallback } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiUser } from '../../../api/types';

import buildClassName from '../../../util/buildClassName';
import { pick } from '../../../util/iteratees';
import { getUserFullName } from '../../../modules/helpers';
import { selectUser, selectUserByUsername } from '../../../modules/selectors';

type OwnProps = {
  userId?: number;
  username?: string;
  children: any;
};

type StateProps = {
  user?: ApiUser;
};

type DispatchProps = Pick<GlobalActions, 'openUserInfo'>;

const MentionLink: FC<OwnProps & StateProps & DispatchProps> = ({ user, children, openUserInfo }) => {
  const title = user ? getUserFullName(user)! : undefined;

  const openMentionedUser = useCallback(() => {
    if (user) {
      openUserInfo({ id: user.id });
    }
  }, [user, openUserInfo]);

  const className = buildClassName(
    'text-entity-link',
    !user && 'not-implemented',
  );

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      onClick={openMentionedUser}
      title={title}
      className={className}
    >
      {children}
    </a>
  );
};

export default withGlobal<OwnProps>(
  (global, { userId, username }): StateProps => {
    if (userId) {
      return {
        user: selectUser(global, userId),
      };
    } else if (username) {
      return {
        user: selectUserByUsername(global, username.substring(1)),
      };
    }

    return {};
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['openUserInfo']),
)(MentionLink);
