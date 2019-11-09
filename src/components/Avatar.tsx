import React, { FC, JsxChildren } from '../lib/teact';

import { ApiChat } from '../modules/tdlib/types/chats';
import { ApiUser } from '../modules/tdlib/types/users';
import { getUserFullName } from '../modules/tdlib/helpers/users';
import './Avatar.scss';

interface IProps {
  size?: 'small' | 'medium' | 'large',
  chat?: ApiChat;
  user?: ApiUser;
  children?: JsxChildren,
}

const Avatar: FC<IProps> = ({ size = 'large', chat, user, children }) => {
  let content = children;

  if (chat && chat.title) {
    content = getFirstLetters(chat.title);
  }

  if (user) {
    const userName = getUserFullName(user);
    content = userName && getFirstLetters(userName);
  }

  return (
    <div className={`Avatar size-${size}`}>
      {content}
    </div>
  );
};

function getFirstLetters(phrase: string) {
  return phrase
    .replace(/[^\W\w\s]+/, '')
    .split(' ')
    .map((word: string) => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

export default Avatar;
