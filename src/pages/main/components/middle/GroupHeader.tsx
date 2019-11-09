import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiChat } from '../../../../modules/tdlib/types';
import Avatar from '../../../../components/Avatar';

type IProps = {
  chat: ApiChat;
};

const GroupHeader: FC<IProps> = ({ chat }) => {
  return (
    <div className="GroupHeader">
      <Avatar size="medium" chat={chat} />
      <div>
        <div className="title">{chat.title}</div>
        <div className="status">Group Chat</div>
      </div>
    </div>
  );
};

export default withGlobal(
  global => {
    const { selectedId, byId } = global.chats;

    const chat = selectedId && byId[selectedId];

    return {
      chat,
    };
  },
)(GroupHeader);
