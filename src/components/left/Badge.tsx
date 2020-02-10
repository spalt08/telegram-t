import React, { FC } from '../../lib/teact/teact';

import { ApiChat } from '../../api/types';
import { formatIntegerCompact } from '../../util/textFormat';

import './Badge.scss';

type IProps = {
  chat: ApiChat;
};

const Badge: FC<IProps> = ({ chat }) => {
  const classNames = ['Badge'];

  if (chat.unread_count) {
    if (chat.is_muted) {
      classNames.push('muted');
    }

    if (chat.unread_mention_count) {
      return (
        <div className="Badge-wrapper">
          <div className="Badge mention">
            <i className="icon-username" />
          </div>
          {chat.unread_count > 1 && (
            <div className={classNames.join(' ')}>
              {chat.unread_count}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={classNames.join(' ')}>
        {formatIntegerCompact(chat.unread_count)}
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
