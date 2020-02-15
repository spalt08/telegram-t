import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage, ApiWebPage } from '../../../api/types';

import { getMessagePlainText, getMessageWebPage, matchLinkInMessageText } from '../../../modules/helpers';
import { calculateMediaDimensions } from './util/mediaDimensions';

import Photo from './Photo';

import './WebPage.scss';

const MAX_WIDTH = 448; // 28 rem
const MAX_TEXT_LENGTH = 170; // symbols

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

  const truncatedDescription = description && description.length > MAX_TEXT_LENGTH
    ? `${description.substr(0, MAX_TEXT_LENGTH)}...`
    : description;

  let style = '';
  const classNames = ['WebPage'];
  if (photo) {
    const { width, height } = calculateMediaDimensions(message);
    if (width === height) {
      classNames.push('with-square-photo');
    } else if (width < MAX_WIDTH) {
      style = `max-width:${width}px`;
    }
  } else {
    classNames.push('without-photo');
  }

  return (
    <div
      className={classNames.join(' ')}
      data-initial={(siteName || displayUrl)[0]}
      // @ts-ignore teact feature
      style={style}
    >
      {photo && (
        <Photo
          message={message}
          load={load}
          onClick={onMediaClick}
          onCancelTransfer={onCancelMediaTransfer}
        />
      )}
      <div className="WebPage-text">
        <a href={url} target="_blank" rel="noopener noreferrer" className="site-name">
          {inSharedMedia ? url : siteName || displayUrl}
        </a>
        <p className="site-title">{inSharedMedia ? title || siteName : title}</p>
        {truncatedDescription && <p className="site-description">{description}</p>}
      </div>
    </div>
  );
};

export default WebPage;
