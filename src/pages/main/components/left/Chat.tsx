import React, { FC } from '../../../../lib/reactt';
import { DispatchMap, withGlobal } from '../../../../lib/reactnt';

import './Chat.scss';

type IProps = {
  id: number,
  chat: Record<string, any>,
} & Pick<DispatchMap, 'selectChat'>;

const Chat: FC<IProps> = ({ chat, selectChat }) => {
  return (
    <div className="Chat" onClick={() => selectChat({ id: chat.id })}>
      <div className="avatar">{getChatLetters(chat)}</div>
      <div className="title">{chat.title}</div>
    </div>
  );
};

function getChatLetters(chat: Record<string, any>) {
  return chat.title
    .replace(/[^\W\w\s]+/, '')
    .split(' ')
    .map((word: string) => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

export default withGlobal(
  (global, ownProps) => {
    const { chats } = global;
    const { id } = ownProps;

    return {
      chat: chats.byId[id],
    };
  },
  (setGlobal, actions) => {
    const { selectChat } = actions;
    return { selectChat };
  },
)(Chat);
