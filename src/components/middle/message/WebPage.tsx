import React, { FC, memo, useCallback } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getMessageWebPage } from '../../../modules/helpers';
import { calculateMediaDimensions } from './helpers/mediaDimensions';

import Photo from './Photo';

import './WebPage.scss';

const MAX_TEXT_LENGTH = 170; // symbols

type OwnProps = {
  message: ApiMessage;
  load?: boolean;
  inPreview?: boolean;
  onMediaClick?: () => void;
  onCancelMediaTransfer?: () => void;
};

const WebPage: FC<OwnProps> = ({
  message,
  load,
  inPreview,
  onMediaClick,
  onCancelMediaTransfer,
}) => {
  const webPage = getMessageWebPage(message);

  let isSquarePhoto = false;
  if (webPage && webPage.photo) {
    const { width, height } = calculateMediaDimensions(message);
    isSquarePhoto = width === height;
  }

  const handleMediaClick = useCallback(() => {
    if (webPage && (isSquarePhoto || webPage.hasDocument)) {
      window.open(webPage.url);
    } else if (onMediaClick) {
      onMediaClick();
    }
  }, [webPage, isSquarePhoto, onMediaClick]);

  if (!webPage) {
    return undefined;
  }

  const {
    siteName,
    url,
    displayUrl,
    title,
    description,
    photo,
  } = webPage;

  const truncatedDescription = description && description.length > MAX_TEXT_LENGTH
    ? `${description.substr(0, MAX_TEXT_LENGTH)}...`
    : description;

  const className = [
    'WebPage',
    photo
      ? (isSquarePhoto && 'with-square-photo')
      : (!inPreview && 'without-photo'),
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      data-initial={(siteName || displayUrl)[0]}
    >
      {photo && (
        <Photo
          message={message}
          load={load}
          onClick={handleMediaClick}
          onCancelUpload={onCancelMediaTransfer}
          size={isSquarePhoto ? 'pictogram' : 'inline'}
        />
      )}
      <div className="WebPage-text">
        <a href={url} target="_blank" rel="noopener noreferrer" className="site-name">
          {siteName || displayUrl}
        </a>
        <p className="site-title">{title}</p>
        {truncatedDescription && <p className="site-description">{description}</p>}
      </div>
    </div>
  );
};

export default memo(WebPage);
