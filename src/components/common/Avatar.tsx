import React, {
  FC, useEffect, useState,
} from '../../lib/teact/teact';

import { ApiUser, ApiChat } from '../../api/types';
import {
  getChatAvatarHash, getChatTitle, isPrivateChat,
  getUserAvatarHash, getUserFullName, isUserOnline, isDeletedUser,
} from '../../modules/helpers';
import * as mediaLoader from '../../util/mediaLoader';

import './Avatar.scss';

interface IProps {
  size?: 'small' | 'medium' | 'large' | 'jumbo';
  showOnlineStatus?: boolean;
  chat?: ApiChat;
  user?: ApiUser;
  isSavedMessages?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className?: string;
}

const Avatar: FC<IProps> = ({
  size = 'large', chat, user, showOnlineStatus, onClick, isSavedMessages, className,
}) => {
  let imageHash: string | null = null;

  if (!isSavedMessages) {
    if (chat) {
      imageHash = getChatAvatarHash(chat);
    } else if (user) {
      imageHash = getUserAvatarHash(user);
    }
  }

  const [, onDataUriUpdate] = useState(null);
  const dataUri = imageHash && mediaLoader.getFromMemory<string>(imageHash);

  useEffect(() => {
    if (imageHash && !dataUri) {
      mediaLoader.fetch(imageHash, mediaLoader.Type.DataUri).then(onDataUriUpdate);
    }
  }, [imageHash, dataUri]);

  let content: string | null = '';
  const isOnline = !isSavedMessages && user && isUserOnline(user);

  if (isSavedMessages) {
    content = <i className="icon-avatar-saved-messages" />;
  } else if (dataUri) {
    content = (
      <img src={dataUri} alt="" />
    );
  } else if (user) {
    const userName = getUserFullName(user);
    if (isDeletedUser(user)) {
      content = <i className="icon-avatar-deleted-account" />;
    } else {
      content = userName ? getFirstLetters(userName).slice(0, 2) : null;
    }
  } else if (chat) {
    const title = getChatTitle(chat);
    content = title && getFirstLetters(title).slice(0, isPrivateChat(chat.id) ? 2 : 1);
  }

  const classNames = ['Avatar', `size-${size}`];
  if (showOnlineStatus && isOnline) {
    classNames.push('online');
  }
  if (className) {
    classNames.push(className);
  }

  return (
    <div
      className={classNames.join(' ')}
      onClick={onClick}
    >
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
