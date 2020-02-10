import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getMessageWebPage } from '../../../modules/helpers';
import Photo from './Photo';

import './WebPage.scss';

type IProps = {
  message: ApiMessage;
  load?: boolean;
  onMediaClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancelMediaTransfer?: () => void;
};

const WebPage: FC<IProps> = ({
  message,
  load,
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
    <div className="WebPage">
      {photo && (
        <Photo
          message={message}
          load={load}
          onClick={onMediaClick}
          onCancelTransfer={onCancelMediaTransfer}
        />
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="site-name">{siteName || displayUrl}</a>
      {title && <p className="site-title">{title}</p>}
      {description && <p className="site-description">{description}</p>}
    </div>
  );
};

export default WebPage;
