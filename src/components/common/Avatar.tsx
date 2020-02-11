import React, { FC, useRef } from '../../lib/teact/teact';

import { ApiUser, ApiChat } from '../../api/types';
import {
  getChatAvatarHash, getChatTitle, isChatPrivate,
  getUserAvatarHash, getUserFullName, isUserOnline, isDeletedUser,
} from '../../modules/helpers';
import * as mediaLoader from '../../util/mediaLoader';
import useMedia from '../../hooks/useMedia';

import './Avatar.scss';
import useShowTransition from '../../hooks/useShowTransition';

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
  const isImageLoaded = Boolean(dataUri);
  const isImagePreloadedRef = useRef(isImageLoaded);
  const {
    shouldRender: shouldImageRender,
    transitionClassNames: imageClassNames,
  } = useShowTransition(isImageLoaded, undefined, noAnimate || isImagePreloadedRef.current!);

  let content: string | null = '';

  if (isSavedMessages) {
    content = <i className="icon-avatar-saved-messages" />;
  } else if (isDeleted) {
    content = <i className="icon-avatar-deleted-account" />;
  } else if (shouldImageRender) {
    content = <img src={dataUri} className={imageClassNames.join(' ')} alt="" />;
  } else if (user) {
    const userName = getUserFullName(user);
    content = userName ? getFirstLetters(userName).slice(0, 2) : null;
  } else if (chat) {
    const title = getChatTitle(chat);
    content = title && getFirstLetters(title).slice(0, isChatPrivate(chat.id) ? 2 : 1);
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
