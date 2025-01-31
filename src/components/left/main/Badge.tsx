import React, { FC } from '../../../lib/teact/teact';

import { ApiChat } from '../../../api/types';
import { formatIntegerCompact } from '../../../util/textFormat';

import './Badge.scss';

type OwnProps = {
  chat: ApiChat;
  isPinned?: boolean;
};

const Badge: FC<OwnProps> = ({ chat, isPinned }) => {
  const classNames = ['Badge'];

  if (chat.unreadCount || chat.hasUnreadMark) {
    if (chat.isMuted) {
      classNames.push('muted');
    }

    if (!chat.unreadCount && chat.hasUnreadMark) {
      return (
        <div className={classNames.join(' ')} />
      );
    }

    if (chat.unreadMentionsCount) {
      return (
        <div className="Badge-wrapper">
          <div className="Badge mention">
            <i className="icon-username" />
          </div>
          {chat.unreadCount! > 1 && (
            <div className={classNames.join(' ')}>
              {chat.unreadCount}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={classNames.join(' ')}>
        {formatIntegerCompact(chat.unreadCount!)}
      </div>
    );
  } else if (isPinned) {
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
