import React, { FC } from '../../../lib/teact/teact';
import { DEBUG } from '../../../config';
import convertPunycode from '../../../lib/punycode';

type IProps = {
  url?: string;
  text: string;
};

const SafeLink: FC<IProps> = ({ url, text }) => {
  if (!url) {
    return null;
  }

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      href={getHref(url)}
      title={getDecodedUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className={text.length > 50 ? 'long-word-break-all' : undefined}
    >
      {text}
    </a>
  );
};

function getHref(url?: string) {
  if (!url) {
    return undefined;
  }

  return url.startsWith('http') ? url : `http://${url}`;
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
