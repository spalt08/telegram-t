import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import Avatar from '../../../../components/Avatar';

import './Chat.scss';

type IProps = {
  id: number,
  chat: Record<string, any>,
  isSelected: boolean,
} & Pick<DispatchMap, 'selectChat'>;

const Chat: FC<IProps> = ({ chat, isSelected, selectChat }) => {
  return (
    <div className={`Chat ${isSelected ? 'selected' : ''}`} onClick={() => selectChat({ id: chat.id })}>
      <Avatar chat={chat} />
      <div className="title">{chat.title}</div>
    </div>
  );
};

export default withGlobal(
  (global, ownProps) => {
    const { chats } = global;
    const { id } = ownProps;

    return {
      chat: chats.byId[id],
      isSelected: Number(id) === chats.selectedId,
    };
  },
  (setGlobal, actions) => {
    const { selectChat } = actions;
    return { selectChat };
  },
)(Chat);
