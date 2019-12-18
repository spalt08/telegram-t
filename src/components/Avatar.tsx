import React, { FC, useEffect, useState } from '../lib/teact';
import { withGlobal } from '../lib/teactn';

import { ApiUser, ApiChat } from '../api/types';
import {
  getChatAvatarHash, getChatTitle, isPrivateChat,
  getUserAvatarHash, getUserFullName, isUserOnline,
} from '../modules/helpers';
import * as mediaLoader from '../util/mediaLoader';

import './Avatar.scss';

interface IProps {
  size?: 'small' | 'medium' | 'large' | 'jumbo';
  showOnlineStatus?: boolean;
  chat?: ApiChat;
  user?: ApiUser;
  imageHash?: string;
}

const Avatar: FC<IProps> = ({
  size = 'large', chat, user, imageHash, showOnlineStatus,
}) => {
  const [, onDataUriUpdate] = useState(null);
  const dataUri = imageHash && mediaLoader.getFromMemory(imageHash);

  useEffect(() => {
    if (imageHash && !dataUri) {
      mediaLoader.fetch(imageHash).then(onDataUriUpdate);
    }
  }, [imageHash, dataUri]);

  let content: string | null = '';
  const isOnline = user && isUserOnline(user);

  if (dataUri) {
    content = (
      <img src={dataUri} alt="" />
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
    let imageHash = null;

    if (chat) {
      imageHash = getChatAvatarHash(chat);
    } else if (user) {
      imageHash = getUserAvatarHash(user);
    }

    return { imageHash };
  },
)(Avatar);
