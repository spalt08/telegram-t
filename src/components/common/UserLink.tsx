import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';
import { GlobalActions } from '../../global/types';
import { ApiChat, ApiUser } from '../../api/types';

type IProps = Pick<GlobalActions, 'openUserInfo' | 'openChatWithInfo'> & {
  className?: string;
  sender?: ApiUser | ApiChat;
  children: any;
};

const UserLink: FC<IProps> = ({
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

export default withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { openUserInfo } = actions;
    return { openUserInfo };
  },
)(UserLink);
