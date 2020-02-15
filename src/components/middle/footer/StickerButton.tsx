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
  setButton?: boolean;
  onStickerSelect: (sticker: ApiSticker) => void;
}

const StickerButton: FC<IProps> = ({
  sticker, top, left, title, setButton, onStickerSelect,
}) => {
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const handleAnimationLoad = useCallback(() => setIsAnimationLoaded(true), []);
  const [playAnimation, setPlayAnimation] = useState(false);

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
    if (isAnimated) {
      setPlayAnimation(true);
    }
  }, [isAnimated]);

  const handleMouseLeave = useCallback(() => {
    if (isAnimated) {
      setPlayAnimation(false);
    }
  }, [isAnimated]);

  const handleClick = useCallback(
    () => onStickerSelect({
      ...sticker,
      localMediaHash,
    }),
    [onStickerSelect, sticker, localMediaHash],
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
  if (setButton) {
    classNames.push('set-button');
  }

  return (
    <button
      className={classNames.join(' ')}
      onClick={handleClick}
      type="button"
      title={title || (sticker && sticker.emoji)}
      // @ts-ignore teact feature
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          play={playAnimation}
          className={['full-media', ...fullMediaClassNames].join(' ')}
          onLoad={handleAnimationLoad}
        />
      )}
    </button>
  );
};

export default memo(StickerButton);
