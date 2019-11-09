import React, { FC, JsxChildren } from '../lib/teact';

import { ApiChat } from '../modules/tdlib/types/chats';
import { ApiUser } from '../modules/tdlib/types/users';
import { getUserFullName } from '../modules/tdlib/helpers';
import { isPrivateChat } from '../modules/tdlib/helpers';
import './Avatar.scss';

interface IProps {
  size?: 'small' | 'medium' | 'large',
  chat?: ApiChat;
  user?: ApiUser;
}

const Avatar: FC<IProps> = ({ size = 'large', chat, user }) => {
  let content = '';

  if (user) {
    const userName = getUserFullName(user);
    content = userName && getFirstLetters(userName).slice(0, 2);
  } else if (chat && chat.title) {
    content = chat.title && getFirstLetters(chat.title).slice(0, isPrivateChat(chat.id) ? 2 : 1);
  }

  return (
    <div className={`Avatar size-${size}`}>
      {content}
    </div>
  );
};

function getFirstLetters(phrase: string) {
  return phrase
    .replace(/[^\wа-яё\s]+/gi, '')
    .trim()
    .split(/\s+/)
    .map((word: string) => word.length && word[0])
    .join('')
    .toUpperCase();
}

export default Avatar;
