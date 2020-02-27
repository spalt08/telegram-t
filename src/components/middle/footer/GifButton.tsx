import React, {
  FC, memo, useCallback, useRef,
} from '../../../lib/teact/teact';

import { ApiVideo } from '../../../api/types';

import buildClassName from '../../../util/buildClassName';
import { calculateVideoDimensions } from '../../../util/mediaDimensions';
import useMedia from '../../../hooks/useMedia';
import useShowTransition from '../../../hooks/useShowTransition';

import Spinner from '../../ui/Spinner';

import './GifButton.scss';

interface IProps {
  gif: ApiVideo;
  loadAndShow: boolean;
  onGifSelect: (gif: ApiVideo) => void;
}

const GifButton: FC<IProps> = ({
  gif, loadAndShow, onGifSelect,
}) => {
  const videoRef = useRef<HTMLVideoElement>();
  const buttonRef = useRef<HTMLButtonElement>();

  const localMediaHash = `gif${gif.id}`;
  const mediaData = useMedia(localMediaHash, !loadAndShow);

  const { transitionClassNames } = useShowTransition(loadAndShow);

  const handleClick = useCallback(() => {
    onGifSelect({
      ...gif,
      blobUrl: mediaData,
    });
  }, [onGifSelect, gif, mediaData]);

  const handleMouseEnter = useCallback(() => {
    if (mediaData) {
      void videoRef.current!.play();
    }
  }, [mediaData]);

  const { width, height } = calculateVideoDimensions(gif, false);

  return (
    <button
      ref={buttonRef}
      className={buildClassName('GifButton overlay', width < height ? 'vertical' : 'horizontal', transitionClassNames)}
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {mediaData ? (
        <video
          ref={videoRef}
          width={width}
          height={height}
          muted
          playsinline
          preload="none"
          poster={gif.thumbnail && gif.thumbnail.dataUri}
        >
          <source src={mediaData} />
        </video>
      ) : (
        <>
          {gif.thumbnail && (
            <img
              src={gif.thumbnail.dataUri}
              width={width}
              height={height}
              alt=""
            />
          )}
          <Spinner color={gif.thumbnail ? 'white' : 'black'} />
        </>
      )}
    </button>
  );
};

export default memo(GifButton);
