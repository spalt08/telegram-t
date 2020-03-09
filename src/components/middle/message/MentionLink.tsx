import React, { FC, useCallback } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiUser } from '../../../api/types';

import buildClassName from '../../../util/buildClassName';
import { getUserFullName } from '../../../modules/helpers';
import { selectUser, selectUserByUserName } from '../../../modules/selectors';

type IProps = {
  userId?: number;
  userName?: string;
  user?: ApiUser;
  children: any;
} & Pick<GlobalActions, 'openUserInfo'>;

const MentionLink: FC<IProps> = ({ user, children, openUserInfo }) => {
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

export default withGlobal(
  (global, { userId, userName }: IProps) => {
    if (userId) {
      return {
        user: selectUser(global, userId),
      };
    } else if (userName) {
      return {
        user: selectUserByUserName(global, userName.substring(1)),
      };
    }

    return null;
  },
  (setGlobal, actions) => {
    const { openUserInfo } = actions;
    return { openUserInfo };
  },
)(MentionLink);
