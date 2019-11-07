import React, { FC, JsxChildren } from '../lib/teact';

import { ApiChat } from '../modules/tdlib/types/chats';

import './Avatar.scss';

interface IProps {
  size?: 'small' | 'medium' | 'large',
  chat?: ApiChat;
  children?: JsxChildren,
}

const Avatar: FC<IProps> = ({ size = 'large', chat, children }) => {
  return (
    <div className={`Avatar size-${size}`}>
      {chat ? getChatLetters(chat) : children}
    </div>
  );
};

function getChatLetters(chat: ApiChat) {
  if (!chat.title) {
    return '';
  }

  return chat.title
    .replace(/[^\W\w\s]+/, '')
    .split(' ')
    .map((word: string) => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

export default Avatar;
