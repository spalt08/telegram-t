import React, { FC } from '../../../../lib/teact';

import { ApiChat } from '../../../../api/types';
import './Badge.scss';

type IProps = {
  chat: ApiChat;
};

// TODO Support mentions.

const Badge: FC<IProps> = ({ chat }) => {
  if (chat.unread_count) {
    return (
      <div className="Badge">
        {chat.unread_count}
      </div>
    );
  } else if (chat.is_pinned) {
    return (
      <div className="Badge pinned">
        <i className="icon-pinned-chat" />
      </div>
    );
  }

  return null;
};

export default Badge;
