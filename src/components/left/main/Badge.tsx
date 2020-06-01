import React, { FC } from '../../../lib/teact/teact';

import { ApiChat } from '../../../api/types';
import { formatIntegerCompact } from '../../../util/textFormat';

import './Badge.scss';

type OwnProps = {
  chat: ApiChat;
};

const Badge: FC<OwnProps> = ({ chat }) => {
  const classNames = ['Badge'];

  if (chat.unreadCount) {
    if (chat.isMuted) {
      classNames.push('muted');
    }

    if (chat.unreadMentionsCount) {
      return (
        <div className="Badge-wrapper">
          <div className="Badge mention">
            <i className="icon-username" />
          </div>
          {chat.unreadCount > 1 && (
            <div className={classNames.join(' ')}>
              {chat.unreadCount}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={classNames.join(' ')}>
        {formatIntegerCompact(chat.unreadCount)}
      </div>
    );
  } else if (chat.isPinned) {
    classNames.push('pinned');

    return (
      <div className={classNames.join(' ')}>
        <i className="icon-pinned-chat" />
      </div>
    );
  }

  return undefined;
};

export default Badge;
