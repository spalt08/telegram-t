import React, { FC } from '../../../lib/teact/teact';
import { DEBUG } from '../../../config';
import convertPunycode from '../../../lib/punycode';

type OwnProps = {
  url?: string;
  text: string;
  children?: any;
};

const SafeLink: FC<OwnProps> = ({ url, text, children }) => {
  if (!url) {
    return undefined;
  }

  const classNames = ['text-entity-link'];
  if (text.length > 50) {
    classNames.push('long-word-break-all');
  }

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      href={getHref(url)}
      title={getDecodedUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames.join(' ')}
    >
      {children || text}
    </a>
  );
};

function getHref(url?: string) {
  if (!url) {
    return undefined;
  }

  return url.includes('://') ? url : `http://${url}`;
}

function getDecodedUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  const href = getHref(url);
  if (!href) {
    return undefined;
  }

  try {
    let decodedHref = decodeURI(href);

    const match = decodedHref.match(/^https?:\/\/([^/:?#]+)(?:[/:?#]|$)/i);
    if (!match) {
      return undefined;
    }
    const domain = match[1];
    decodedHref = decodedHref.replace(domain, convertPunycode(domain));

    return decodedHref;
  } catch (error) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('SafeLink.getDecodedUrl error ', url, error);
    }
  }

  return undefined;
}

export default SafeLink;
