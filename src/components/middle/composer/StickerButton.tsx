import React, {
  FC, memo, useCallback, useState,
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
  top?: number;
  left?: number;
  title?: string;
  className?: string;
  onClick: (sticker: ApiSticker) => void;
}

const StickerButton: FC<IProps> = ({
  sticker, top, left, title, className, onClick,
}) => {
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const handleAnimationLoad = useCallback(() => setIsAnimationLoaded(true), []);

  const isAnimated = sticker.is_animated;

  const localMediaHash = `sticker${sticker.id}`;
  const mediaData = useMedia(
    localMediaHash,
    undefined,
    isAnimated ? mediaLoader.Type.Lottie : mediaLoader.Type.BlobUrl,
  );
  const isMediaLoaded = Boolean(mediaData);
  const {
    shouldRenderFullMedia, transitionClassNames,
  } = useProgressiveMedia(isAnimated ? isAnimationLoaded : isMediaLoaded, 'fast');

  const handleMouseEnter = useCallback(() => {
    if (shouldPlay) {
      setShouldPlay(false);
      requestAnimationFrame(() => {
        setShouldPlay(true);
      });
    } else {
      setShouldPlay(true);
    }
  }, [shouldPlay]);

  const handleClick = useCallback(
    () => onClick({
      ...sticker,
      localMediaHash,
    }),
    [onClick, sticker, localMediaHash],
  );

  const isAbsolutePositioned = top !== undefined && left !== undefined;
  const style = isAbsolutePositioned ? `top: ${top}px; left: ${left}px` : '';

  const fullClassName = buildClassName(
    'StickerButton',
    className,
    isAbsolutePositioned && 'absolute-position',
  );

  return (
    <button
      className={fullClassName}
      onClick={handleClick}
      type="button"
      title={title || (sticker && sticker.emoji)}
      // @ts-ignore teact feature
      style={style}
      onMouseEnter={isAnimated ? handleMouseEnter : undefined}
    >
      {!isAnimated && shouldRenderFullMedia && (
        <img
          src={mediaData as string}
          alt=""
          className={transitionClassNames}
        />
      )}
      {isAnimated && isMediaLoaded && (
        <AnimatedSticker
          animationData={mediaData as AnyLiteral}
          play={shouldPlay}
          noLoop
          className={transitionClassNames}
          onLoad={handleAnimationLoad}
        />
      )}
    </button>
  );
};

export default memo(StickerButton);
