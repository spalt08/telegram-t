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
  top: number;
  left: number;
  onStickerSelect: (sticker: ApiSticker) => void;
}

const StickerButton: FC<IProps> = ({
  sticker, top, left, onStickerSelect,
}) => {
  const handleClick = useCallback(
    () => onStickerSelect(sticker),
    [sticker, onStickerSelect],
  );

  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const handleAnimationLoad = useCallback(() => setIsAnimationLoaded(true), []);

  const isAnimated = sticker.is_animated;

  const mediaData = useMedia(
    `sticker${sticker.id}`,
    undefined,
    isAnimated ? mediaLoader.Type.Lottie : mediaLoader.Type.BlobUrl,
  );
  const isMediaLoaded = Boolean(mediaData);
  const isMediaPreloadedRef = useRef<boolean>(isMediaLoaded);

  const {
    shouldRender: shouldFullMediaRender,
    transitionClassNames: fullMediaClassNames,
  } = useShowTransition(isAnimated ? isAnimationLoaded : isMediaLoaded, undefined, isMediaPreloadedRef.current!);

  return (
    <button
      className="StickerButton"
      onClick={handleClick}
      type="button"
      title={sticker && sticker.emoji}
      // @ts-ignore teact feature
      style={`top: ${top}px; left: ${left}px`}
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
          play={false}
          className={['full-media', ...fullMediaClassNames].join(' ')}
          onLoad={handleAnimationLoad}
        />
      )}
    </button>
  );
};

export default memo(StickerButton);
