import React, {
  FC, memo, useCallback, useState, useRef,
} from '../../../lib/teact/teact';

import { ApiSticker } from '../../../api/types';

import * as mediaLoader from '../../../util/mediaLoader';
import useShowTransition from '../../../hooks/useShowTransition';
import useMedia from '../../../hooks/useMedia';

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
  const isMediaPreloadedRef = useRef<boolean>(isMediaLoaded);

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

  const {
    shouldRender: shouldFullMediaRender,
    transitionClassNames: fullMediaClassNames,
  } = useShowTransition(isAnimated ? isAnimationLoaded : isMediaLoaded, undefined, isMediaPreloadedRef.current!);

  const isAbsolutePositioned = top !== undefined && left !== undefined;
  const style = isAbsolutePositioned ? `top: ${top}px; left: ${left}px` : '';
  const classNames = ['StickerButton'];
  if (isAbsolutePositioned) {
    classNames.push('absolute-position');
  }
  if (className) {
    classNames.push(className);
  }

  return (
    <button
      className={classNames.join(' ')}
      onClick={handleClick}
      type="button"
      title={title || (sticker && sticker.emoji)}
      // @ts-ignore teact feature
      style={style}
      onMouseEnter={isAnimated ? handleMouseEnter : undefined}
    >
      {(!isAnimated && shouldFullMediaRender) && (
        <img
          src={mediaData as string}
          alt=""
          className={['full-media', ...fullMediaClassNames].join(' ')}
        />
      )}
      {isAnimated && isMediaLoaded && (
        <AnimatedSticker
          animationData={mediaData as AnyLiteral}
          play={shouldPlay}
          noLoop
          className={['full-media', ...fullMediaClassNames].join(' ')}
          onLoad={handleAnimationLoad}
        />
      )}
    </button>
  );
};

export default memo(StickerButton);
