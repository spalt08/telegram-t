import React, { FC } from '../../../../lib/reactt';
import { withGlobal } from '../../../../lib/reactnt';

import './Chat.scss';

type IProps = {
  id: number,
  chat: Record<string, any>,
};

const Chat: FC<IProps> = ({ chat }) => {
  return (
    <div className="Chat">
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

    const chat = chats!.byId[id];

    return { chat };
  },
)(Chat);
