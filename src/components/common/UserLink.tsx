import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat, ApiUser } from '../../api/types';

import { pick } from '../../util/iteratees';

type OwnProps = {
  className?: string;
  sender?: ApiUser | ApiChat;
  children: any;
};

type DispatchProps = Pick<GlobalActions, 'openUserInfo'>;

const UserLink: FC<OwnProps & DispatchProps> = ({
  className, sender, openUserInfo, children,
}) => {
  const openSenderInfo = useCallback(() => {
    if (sender) {
      openUserInfo({ id: sender.id });
    }
  }, [sender, openUserInfo]);

  if (!sender) {
    return children;
  }

  return (
    <span className={`UserLink ${className || ''}`} onClick={openSenderInfo}>
      {children}
    </span>
  );
};

export default withGlobal<OwnProps>(
  undefined,
  (setGlobal, actions): DispatchProps => pick(actions, ['openUserInfo']),
)(UserLink);
