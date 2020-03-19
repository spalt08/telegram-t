import React, {
  FC, memo, useCallback, useEffect, useRef, useState,
} from '../../../lib/teact/teact';

import { ApiVideo } from '../../../api/types';

import * as mediaLoader from '../../../util/mediaLoader';
import buildClassName from '../../../util/buildClassName';
import useMedia from '../../../hooks/useMedia';
import useProgressiveMedia from '../../../hooks/useProgressiveMedia';

import Spinner from '../../ui/Spinner';

import './GifButton.scss';

interface IProps {
  gif: ApiVideo;
  load: boolean;
  onClick: (gif: ApiVideo) => void;
}

const GifButton: FC<IProps> = ({
  gif, load, onClick,
}) => {
  const ref = useRef<HTMLDivElement>();

  const localMediaHash = `gif${gif.id}`;

  const previewBlobUrl = useMedia(`${localMediaHash}?size=m`, !load, mediaLoader.Type.BlobUrl);
  const { transitionClassNames } = useProgressiveMedia(previewBlobUrl, 'fast');

  const [shouldPlay, setShouldPlay] = useState(false);
  const videoBlobUrl = useMedia(localMediaHash, !shouldPlay, mediaLoader.Type.BlobUrl);

  const play = useCallback(() => {
    setShouldPlay(true);
  }, []);

  const stop = useCallback(() => {
    setShouldPlay(false);
  }, []);

  useEffect(() => {
    if (!shouldPlay) {
      return undefined;
    }

    function handleMouseMove(e: MouseEvent) {
      const buttonElement = e.target && (e.target as HTMLElement).closest('.GifButton');
      if (buttonElement !== ref.current) {
        stop();
      }
    }

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [shouldPlay, stop]);

  const handleClick = useCallback(
    () => onClick({
      ...gif,
      blobUrl: videoBlobUrl,
    }),
    [onClick, gif, videoBlobUrl],
  );

  const previewData = previewBlobUrl || (gif.thumbnail && gif.thumbnail.dataUri);
  const className = buildClassName(
    'GifButton',
    gif.width && gif.height && gif.width < gif.height ? 'vertical' : 'horizontal',
    transitionClassNames,
  );

  return (
    <div
      ref={ref}
      className={className}
      onClick={handleClick}
      onMouseMove={play}
      onMouseLeave={stop}
    >
      {!(videoBlobUrl && shouldPlay) && (
        <div
          className="preview"
          // @ts-ignore
          style={`background-image: url(${previewData});`}
        />
      )}
      {shouldPlay && (
        videoBlobUrl ? (
          <video
            autoPlay
            loop
            muted
            playsinline
            preload="none"
            poster={previewData}
          >
            <source src={videoBlobUrl} />
          </video>
        ) : (
          <Spinner color={previewData ? 'white' : 'black'} />
        )
      )}
    </div>
  );
};

export default memo(GifButton);
