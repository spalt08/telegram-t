import React, {
  FC, memo, useCallback, useEffect, useRef, useState,
} from '../../../lib/teact/teact';

import { ApiSticker } from '../../../api/types';

import * as mediaLoader from '../../../util/mediaLoader';
import useMedia from '../../../hooks/useMedia';
import useProgressiveMedia from '../../../hooks/useProgressiveMedia';
import buildClassName from '../../../util/buildClassName';

import AnimatedSticker from '../../common/AnimatedSticker';

import './StickerButton.scss';

interface IProps {
  sticker: ApiSticker;
  load: boolean;
  title?: string;
  className?: string;
  onClick: (sticker: ApiSticker) => void;
}

const StickerButton: FC<IProps> = ({
  sticker, load, title, className, onClick,
}) => {
  const ref = useRef<HTMLDivElement>();

  const isAnimated = sticker.is_animated;
  const localMediaHash = `sticker${sticker.id}`;

  const previewBlobUrl = useMedia(`${localMediaHash}?size=m`, !load, mediaLoader.Type.BlobUrl);
  const { transitionClassNames } = useProgressiveMedia(previewBlobUrl, 'slow');

  const [shouldPlay, setShouldPlay] = useState(false);
  const lottieData = useMedia(localMediaHash, !shouldPlay, mediaLoader.Type.Lottie);
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const handleAnimationLoad = useCallback(() => setIsAnimationLoaded(true), []);

  const play = isAnimated ? () => {
    setShouldPlay(true);
  } : undefined;

  const stop = isAnimated ? () => {
    setShouldPlay(false);
    setIsAnimationLoaded(false);
  } : undefined;

  useEffect(() => {
    if (!shouldPlay) {
      return undefined;
    }

    function handleMouseMove(e: MouseEvent) {
      const buttonElement = e.target && (e.target as HTMLElement).closest('.StickerButton');
      if (stop && buttonElement !== ref.current) {
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
      ...sticker,
      localMediaHash,
    }),
    [onClick, sticker, localMediaHash],
  );

  const fullClassName = buildClassName(
    'StickerButton',
    className,
    transitionClassNames,
  );

  const style = isAnimationLoaded && shouldPlay ? '' : `background-image: url(${previewBlobUrl})`;

  return (
    <div
      ref={ref}
      className={fullClassName}
      title={title || (sticker && sticker.emoji)}
      // @ts-ignore
      style={style}
      onClick={handleClick}
      onMouseMove={play}
      onMouseLeave={stop}
    >
      {shouldPlay && lottieData && (
        <AnimatedSticker
          animationData={lottieData}
          play
          onLoad={handleAnimationLoad}
        />
      )}
    </div>
  );
};

export default memo(StickerButton);
