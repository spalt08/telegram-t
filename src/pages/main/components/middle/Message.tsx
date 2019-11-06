import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import Avatar from '../../../../components/Avatar';

import './Message.scss';

type IProps = {
  message: Record<string, any>,
  isSelected: boolean,
} & Pick<DispatchMap, 'selectMessage'>;

const Message: FC<IProps> = ({ message, isSelected }) => {
  const text = message.content.text.text;

  return (
    <div className={`Message ${isSelected ? 'selected' : ''}`}>
      <Avatar size="small">HE</Avatar>
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
)(Message);
