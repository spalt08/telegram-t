import React, { FC } from '../../lib/teact/teact';

import { ApiChat } from '../../api/types';
import { getPlatform, isSafari } from '../../util/environment';
import './Badge.scss';

type IProps = {
  chat: ApiChat;
};

// TODO Support mentions.

const Badge: FC<IProps> = ({ chat }) => {
  const classNames = ['Badge'];

  if (chat.unread_count) {
    if (getPlatform() === 'Mac OS' && !isSafari()) {
      classNames.push('mac-os-fix');
    }

    return (
      <div className={classNames.join(' ')}>
        {chat.unread_count}
      </div>
    );
  } else if (chat.is_pinned) {
    classNames.push('pinned');

    return (
      <div className={classNames.join(' ')}>
        <i className="icon-pinned-chat" />
      </div>
    );
  }

  return null;
};

export default Badge;