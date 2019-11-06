import React, { FC } from '../../../../lib/reactt';
import { DispatchMap, withGlobal } from '../../../../lib/reactnt';

import Avatar from '../../../../components/Avatar';

import './Message.scss';

type IProps = {
  message: Record<string, any>,
  isSelected: boolean,
} & Pick<DispatchMap, 'selectMessage'>;

const Chat: FC<IProps> = ({ message, isSelected, selectMessage }) => {
  const text = message.content.text.text;

  return (
    <div className={`Message ${isSelected ? 'selected' : ''}`} /*onClick={() => ({ id: message.id })}*/>
      <Avatar small>HE</Avatar>
      <div className="text">{text}</div>
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
    const { messages } = global;
    const { id } = ownProps;

    return {
      isSelected: Number(id) === messages.selectedId,
    };
  },
  (setGlobal, actions) => {
    const { selectMessage } = actions;
    return { selectMessage };
  },
)(Chat);
