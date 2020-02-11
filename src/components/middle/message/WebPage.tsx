import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getMessageWebPage } from '../../../modules/helpers';
import Photo from './Photo';

import './WebPage.scss';

type IProps = {
  message: ApiMessage;
  load?: boolean;
  showUrl?: boolean;
  onMediaClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancelMediaTransfer?: () => void;
};

const WebPage: FC<IProps> = ({
  message,
  load,
  showUrl,
  onMediaClick,
  onCancelMediaTransfer,
}) => {
  const {
    siteName,
    url,
    displayUrl,
    title,
    description,
    photo,
  } = getMessageWebPage(message)!;

  return (
    <div className={`WebPage ${!photo ? 'without-photo' : ''}`} data-initial={displayUrl.charAt(0)}>
      {photo && (
        <Photo
          message={message}
          load={load}
          onClick={onMediaClick}
          onCancelTransfer={onCancelMediaTransfer}
        />
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="site-name">
        {showUrl ? url : siteName || displayUrl}
      </a>
      {title && <p className="site-title">{title}</p>}
      {description && <p className="site-description">{description}</p>}
    </div>
  );
};

export default WebPage;
