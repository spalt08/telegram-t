import React, { FC, memo, useCallback } from '../../../lib/teact/teact';

import { ApiMessage, ApiWebPage } from '../../../api/types';

import { getMessageSummaryText, getMessageWebPage, matchLinkInMessageText } from '../../../modules/helpers';
import buildClassName from '../../../util/buildClassName';

import Media from './Media';

import './WebLink.scss';

const MAX_TEXT_LENGTH = 170; // symbols

type OwnProps = {
  message: ApiMessage;
};

const WebLink: FC<OwnProps> = ({ message }) => {
  let linkData: ApiWebPage | undefined = getMessageWebPage(message);

  if (!linkData) {
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

  const handleMediaClick = useCallback(() => {
    if (linkData) {
      window.open(linkData.url);
    }
  }, [linkData]);

  if (!linkData) {
    return undefined;
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

  const className = buildClassName(
    'WebLink',
    !photo && 'without-photo',
  );

  return (
    <div
      className={className}
      data-initial={(siteName || displayUrl)[0]}
    >
      {photo && (
        <Media message={message} onClick={handleMediaClick} />
      )}
      <p className="site-title">{title || siteName || displayUrl}</p>
      {truncatedDescription && <p className="site-description">{description}</p>}
      <a href={url} target="_blank" rel="noopener noreferrer" className="site-name">
        {url.replace('mailto:', '') || displayUrl}
      </a>
    </div>
  );
};

export default memo(WebLink);
