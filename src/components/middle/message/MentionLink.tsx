import React, { FC } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiUser } from '../../../api/types';
import { getUserFullName } from '../../../modules/helpers';
import { selectUser } from '../../../modules/selectors';

type IProps = {
  userId?: number;
  userName?: string;
  user?: ApiUser;
  children: any;
};

const MentionLink: FC<IProps> = ({ userId, user, children }) => {
  const title = userId && user ? getUserFullName(user) as string : undefined;

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      onClick={(event) => event.preventDefault()}
      title={title}
      className="text-entity-link not-implemented"
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
      // TODO selecting user by username is not implemented
      return null;
    }

    return null;
  },
)(MentionLink);
