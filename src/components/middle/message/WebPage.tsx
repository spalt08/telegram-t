import React, { FC, memo, useCallback } from '../../../lib/teact/teact';

import { ApiMessage, ApiWebPage } from '../../../api/types';

import { getMessageSummaryText, getMessageWebPage, matchLinkInMessageText } from '../../../modules/helpers';
import { calculateMediaDimensions } from './util/mediaDimensions';

import Photo from './Photo';

import './WebPage.scss';

const MAX_TEXT_LENGTH = 170; // symbols

type IProps = {
  message: ApiMessage;
  load?: boolean;
  inSharedMedia?: boolean; // TODO Extract as a separate component.
  inPreview?: boolean;
  onMediaClick?: () => void;
  onCancelMediaTransfer?: () => void;
};

const WebPage: FC<IProps> = ({
  message,
  load,
  inSharedMedia,
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

  let linkData: ApiWebPage | undefined = webPage;

  if (!webPage && inSharedMedia) {
    const link = matchLinkInMessageText(message);
    if (link) {
      const { url, domain } = link;
      const messageText = getMessageSummaryText(message);

      linkData = {
        siteName: domain.replace(/^www./, ''),
        url: url.includes('://') ? url : url.includes('@') ? `mailto:${url}` : `http://${url}`,
        description: messageText !== url ? messageText : undefined,
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
          onCancelTransfer={onCancelMediaTransfer}
          size={isSquarePhoto ? 'pictogram' : 'inline'}
        />
      )}
      <div className="WebPage-text">
        <a href={url} target="_blank" rel="noopener noreferrer" className="site-name">
          {inSharedMedia ? url.replace('mailto:', '') : siteName || displayUrl}
        </a>
        <p className="site-title">{inSharedMedia ? title || siteName || displayUrl : title}</p>
        {truncatedDescription && <p className="site-description">{description}</p>}
      </div>
    </div>
  );
};

export default memo(WebPage);
