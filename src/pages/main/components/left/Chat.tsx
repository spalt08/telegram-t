import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';
import { ApiChat } from '../../../../modules/tdlib/types/chats';
import { getMessageText } from '../../../../modules/tdlib/helpers';
import Avatar from '../../../../components/Avatar';
import LastMessageMeta from './LastMessageMeta';

import './Chat.scss';

type IProps = {
  id: number,
  chat: ApiChat,
  isSelected: boolean,
} & Pick<DispatchMap, 'selectChat'>;

const Chat: FC<IProps> = ({ chat, isSelected, selectChat }) => {
  return (
    <div className={`Chat ${isSelected ? 'selected' : ''}`} onClick={() => selectChat({ id: chat.id })}>
      <Avatar chat={chat} />
      <div className="info">
        <div className="title">{chat.title}</div>
        <div className="last-message">{chat.last_message && getMessageText(chat.last_message)}</div>
        {chat.last_message && (
          <LastMessageMeta message={chat.last_message} />
        )}
      </div>
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
