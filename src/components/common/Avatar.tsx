import React, { FC, useEffect, useState } from '../../lib/teact/teact';

import { ApiUser, ApiChat } from '../../api/types';
import {
  getChatAvatarHash, getChatTitle, isPrivateChat,
  getUserAvatarHash, getUserFullName, isUserOnline, isDeletedUser,
} from '../../modules/helpers';
import * as mediaLoader from '../../util/mediaLoader';
import useMedia from '../../hooks/useMedia';

import './Avatar.scss';

interface IProps {
  size?: 'small' | 'medium' | 'large' | 'jumbo';
  showOnlineStatus?: boolean;
  chat?: ApiChat;
  user?: ApiUser;
  isSavedMessages?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className?: string;
  noAnimate?: boolean;
}

const Avatar: FC<IProps> = ({
  size = 'large',
  chat,
  user,
  showOnlineStatus,
  onClick,
  isSavedMessages,
  className,
  noAnimate,
}) => {
  const isDeleted = user && isDeletedUser(user);
  let imageHash: string | undefined;

  if (!isSavedMessages && !isDeleted) {
    if (chat) {
      imageHash = getChatAvatarHash(chat);
    } else if (user) {
      imageHash = getUserAvatarHash(user);
    }
  }

  const dataUri = useMedia(imageHash, false, mediaLoader.Type.DataUri);
  const [isImageShown, setIsImageShown] = useState(noAnimate || dataUri);

  useEffect(() => {
    if (dataUri) {
      setIsImageShown(true);
    }
  }, [dataUri]);

  let image: string | null = '';
  let placeholder: string | null = '';

  if (isSavedMessages) {
    image = <i className="icon-avatar-saved-messages" />;
  } else if (isDeleted) {
    image = <i className="icon-avatar-deleted-account" />;
  } else {
    if (dataUri) {
      image = <img src={dataUri} className={isImageShown ? 'shown' : ''} alt="" />;
    }

    if (!dataUri || !isImageShown) {
      if (user) {
        const userName = getUserFullName(user);
        placeholder = userName ? getFirstLetters(userName).slice(0, 2) : null;
      } else if (chat) {
        const title = getChatTitle(chat);
        placeholder = title && getFirstLetters(title).slice(0, isPrivateChat(chat.id) ? 2 : 1);
      }
    }
  }

  const isOnline = !isSavedMessages && user && isUserOnline(user);
  const classNames = ['Avatar', `size-${size}`];

  if (showOnlineStatus && isOnline) {
    classNames.push('online');
  }
  if (className) {
    classNames.push(className);
  }
  if (onClick) {
    classNames.push('action');
  }

  return (
    <div
      className={classNames.join(' ')}
      onClick={onClick}
    >
      {placeholder}
      {image}
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
