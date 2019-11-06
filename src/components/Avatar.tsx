import React, { FC, JsxChildren } from '../lib/teact';

import './Avatar.scss';

interface IProps {
  size?: 'small' | 'medium' | 'large',
  chat?: Record<string, any>;
  children?: JsxChildren,
}

const Avatar: FC<IProps> = ({ size = 'large', chat, children }) => {
  return (
    <div className={`Avatar size-${size}`}>
      {chat ? getChatLetters(chat) : children}
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

export default Avatar;
