import { MouseEvent as ReactMouseEvent } from 'react';
import React, { FC, useCallback } from '../../lib/teact/teact';

import { ApiUser, ApiChat, ApiMediaFormat } from '../../api/types';
import {
  getChatAvatarHash, getChatTitle, isChatPrivate,
  getUserFullName, isUserOnline, isDeletedUser,
} from '../../modules/helpers';
import { getFirstLetters } from '../../util/textFormat';
import useMedia from '../../hooks/useMedia';
import useTransitionForMedia from '../../hooks/useTransitionForMedia';
import buildClassName from '../../util/buildClassName';

import './Avatar.scss';

type OwnProps = {
  size?: 'small' | 'medium' | 'large' | 'jumbo';
  showOnlineStatus?: boolean;
  chat?: ApiChat;
  user?: ApiUser;
  isSavedMessages?: boolean;
  onClick?: (e: ReactMouseEvent<HTMLDivElement, MouseEvent>, hasPhoto: boolean) => void;
  className?: string;
};

const Avatar: FC<OwnProps> = ({
  size = 'large',
  chat,
  user,
  showOnlineStatus,
  onClick,
  isSavedMessages,
  className,
}) => {
  const isDeleted = user && isDeletedUser(user);
  let imageHash: string | undefined;

  if (!isSavedMessages && !isDeleted) {
    if (chat) {
      imageHash = getChatAvatarHash(chat);
    } else if (user) {
      imageHash = getChatAvatarHash(user);
    }
  }

  const dataUri = useMedia(imageHash, false, ApiMediaFormat.DataUri);
  const { shouldRenderFullMedia, transitionClassNames } = useTransitionForMedia(dataUri, 'slow');

  let content: string | null = '';

  if (isSavedMessages) {
    content = <i className="icon-avatar-saved-messages" />;
  } else if (isDeleted) {
    content = <i className="icon-avatar-deleted-account" />;
  } else if (shouldRenderFullMedia) {
    content = <img src={dataUri} className={`${transitionClassNames} avatar-media`} alt="" decoding="async" />;
  } else if (user) {
    const userName = getUserFullName(user);
    content = userName ? getFirstLetters(userName).slice(0, 2) : null;
  } else if (chat) {
    const title = getChatTitle(chat);
    content = title && getFirstLetters(title).slice(0, isChatPrivate(chat.id) ? 2 : 1);
  }

  const isOnline = !isSavedMessages && user && isUserOnline(user);
  const fullClassName = buildClassName(
    `Avatar size-${size}`,
    className,
    showOnlineStatus && isOnline && 'online',
    onClick && 'action',
    (!isSavedMessages && !shouldRenderFullMedia) && 'no-photo',
  );

  const handleClick = useCallback((e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
    if (onClick) {
      onClick(e, isSavedMessages || shouldRenderFullMedia);
    }
  }, [onClick, isSavedMessages, shouldRenderFullMedia]);

  return (
    <div className={fullClassName} onClick={handleClick}>
      {content}
    </div>
  );
};

export default Avatar;
