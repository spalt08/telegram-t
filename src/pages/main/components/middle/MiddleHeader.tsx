import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import Avatar from '../../../../components/Avatar';

import './MiddleHeader.scss';

type IProps = {
  chat: AnyLiteral;
};

const MiddleHeader: FC<IProps> = ({ chat }) => {
  return (
    <div className="MiddleHeader">
      <Avatar size="medium" chat={chat} />
      <div className="title">{chat.title}</div>
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
)(MiddleHeader);
