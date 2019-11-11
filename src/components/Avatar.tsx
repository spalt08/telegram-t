import React, { FC } from '../lib/teact';

import { ApiUser, ApiChat } from '../api/tdlib/types';
import {
  getChatImage, getChatTitle, getUserFullName, getUserImage, isPrivateChat,
} from '../modules/tdlib/helpers';

import './Avatar.scss';
import { withGlobal } from '../lib/teactn';

interface IProps {
  size?: 'small' | 'medium' | 'large';
  chat?: ApiChat;
  user?: ApiUser;
  imageUrl?: string;
}

const Avatar: FC<IProps> = ({
  size = 'large', chat, user, imageUrl,
}) => {
  let content: string | null = '';

  if (imageUrl) {
    content = (
      <img src={imageUrl} alt="" />
    );
  } else if (user) {
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

// TODO Store should be updated by images load
// TODO Preload images to avoid flickering
export default withGlobal(
  (global, { chat, user }) => {
    let imageUrl = null;

    if (chat) {
      imageUrl = getChatImage(chat);
    } else if (user) {
      imageUrl = getUserImage(user);
    }

    return { imageUrl };
  },
)(Avatar);
