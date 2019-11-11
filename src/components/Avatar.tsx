import React, { FC } from '../lib/teact';

import { ApiUser, ApiChat } from '../api/tdlib/types';
import { getChatTitle, getUserFullName, isPrivateChat } from '../modules/tdlib/helpers';

import './Avatar.scss';

interface IProps {
  size?: 'small' | 'medium' | 'large';
  chat?: ApiChat;
  user?: ApiUser;
}

const Avatar: FC<IProps> = ({ size = 'large', chat, user }) => {
  let content: string | null = '';

  if (user) {
    const userName = getUserFullName(user);
    content = userName ? getFirstLetters(userName).slice(0, 2) : null;
  } else if (chat) {
    const title = getChatTitle(chat);
    content = title && getFirstLetters(title).slice(0, isPrivateChat(chat.id) ? 2 : 1);
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
