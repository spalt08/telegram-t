import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiUser, ApiTypingStatus } from '../../api/types';

import { selectUser } from '../../modules/selectors';
import { getUserFirstName } from '../../modules/helpers';

import './TypingStatus.scss';

type IProps = {
  typingStatus: ApiTypingStatus;
  typingUser?: ApiUser;
};

const TypingStatus: FC<IProps> = ({ typingStatus, typingUser }) => {
  const typingUserName = typingUser && !typingUser.is_self && getUserFirstName(typingUser);

  return (
    <p className="typing-status">
      {typingUserName && (
        <span className="sender-name">{typingUserName}</span>
      )}
      {typingStatus.action}
    </p>
  );
};

export default memo(withGlobal(
  (global, { typingStatus }: IProps) => {
    if (!typingStatus.userId) {
      return {};
    }

    const typingUser = selectUser(global, typingStatus.userId);

    return { typingUser };
  },
)(TypingStatus));
