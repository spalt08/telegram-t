import React, { FC } from '../lib/teact';
import { withGlobal } from '../lib/teactn';

import { ApiUser, ApiChat } from '../api/tdlib/types';
import {
  getChatTitle, getUserFullName, isPrivateChat, isUserOnline,
} from '../modules/helpers';
import { selectChatPhotoUrl, selectUserPhotoUrl } from '../modules/selectors';

import './Avatar.scss';

interface IProps {
  size?: 'small' | 'medium' | 'large' | 'jumbo';
  showOnlineStatus?: boolean;
  chat?: ApiChat;
  user?: ApiUser;
  imageUrl?: string;
}

const Avatar: FC<IProps> = ({
  size = 'large', chat, user, imageUrl, showOnlineStatus,
}) => {
  let content: string | null = '';
  const isOnline = user && isUserOnline(user);

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
    <div className={`Avatar size-${size} ${showOnlineStatus && isOnline ? 'online' : ''}`}>
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

export default withGlobal(
  (global, { chat, user }) => {
    let imageUrl = null;

    if (chat) {
      imageUrl = selectChatPhotoUrl(global, chat);
    } else if (user) {
      imageUrl = selectUserPhotoUrl(global, user);
    }

    return { imageUrl };
  },
)(Avatar);
