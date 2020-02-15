import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage, ApiWebPage } from '../../../api/types';

import { getMessagePlainText, getMessageWebPage, matchLinkInMessageText } from '../../../modules/helpers';
import Photo from './Photo';

import './WebPage.scss';

type IProps = {
  message: ApiMessage;
  load?: boolean;
  inSharedMedia?: boolean; // TODO Extract as a separate component.
  onMediaClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancelMediaTransfer?: () => void;
};

const WebPage: FC<IProps> = ({
  message,
  load,
  inSharedMedia,
  onMediaClick,
  onCancelMediaTransfer,
}) => {
  const webPage = getMessageWebPage(message);
  let linkData: ApiWebPage | undefined = webPage;

  if (!webPage && inSharedMedia) {
    const link = matchLinkInMessageText(message);
    if (link && link.length >= 2) {
      linkData = {
        siteName: link[1].replace(/^www./, ''),
        url: link[0],
        description: getMessagePlainText(message),
      } as ApiWebPage;
    }
  }

  if (!linkData) {
    return null;
  }

  const {
    siteName,
    url,
    displayUrl,
    title,
    description,
    photo,
  } = linkData;
  return (
    <div className={`WebPage ${!photo ? 'without-photo' : ''}`} data-initial={(siteName || displayUrl)[0]}>
      {photo && (
        <Photo
          message={message}
          load={load}
          onClick={onMediaClick}
          onCancelTransfer={onCancelMediaTransfer}
        />
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="site-name">
        {inSharedMedia ? url : siteName || displayUrl}
      </a>
      <p className="site-title">{inSharedMedia ? title || siteName : title}</p>
      {description && <p className="site-description">{description}</p>}
    </div>
  );
};

export default WebPage;
