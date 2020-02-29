import React, {
  FC, useCallback, useState,
} from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getStickerDimensions } from '../../common/helpers/mediaDimensions';
import { getMessageMediaHash, getMessageMediaThumbDataUri } from '../../../modules/helpers';
import * as mediaLoader from '../../../util/mediaLoader';
import useMedia from '../../../hooks/useMedia';
import useProgressiveMedia from '../../../hooks/useProgressiveMedia';
import buildClassName from '../../../util/buildClassName';

import AnimatedSticker from '../../common/AnimatedSticker';

import './Sticker.scss';

type IProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
};

const Sticker: FC<IProps> = ({
  message, loadAndPlay,
}) => {
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const handleAnimationLoad = useCallback(() => setIsAnimationLoaded(true), []);

  const sticker = message.content.sticker!;
  const isAnimated = sticker.is_animated;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const mediaData = useMedia(
    sticker.localMediaHash || getMessageMediaHash(message, 'inline'),
    !loadAndPlay,
    isAnimated ? mediaLoader.Type.Lottie : mediaLoader.Type.BlobUrl,
  );
  const isMediaLoaded = Boolean(mediaData);
  const {
    shouldRenderThumb, shouldRenderFullMedia, transitionClassNames,
  } = useProgressiveMedia(isAnimated ? isAnimationLoaded : isMediaLoaded, 'fast');

  const { width, height } = getStickerDimensions(sticker);
  const thumbClassName = buildClassName('thumbnail', !thumbDataUri && 'empty');

  return (
    <div className="media-inner">
      {shouldRenderThumb && (
        <img
          src={thumbDataUri}
          width={width}
          height={height}
          alt=""
          className={thumbClassName}
        />
      )}
      {!isAnimated && shouldRenderFullMedia && (
        <img
          src={mediaData as string}
          width={width}
          height={height}
          alt=""
          className={['full-media', transitionClassNames].join(' ')}
        />
      )}
      {isAnimated && isMediaLoaded && (
        <AnimatedSticker
          animationData={mediaData as AnyLiteral}
          width={width}
          height={height}
          play={loadAndPlay}
          className={['full-media', transitionClassNames].join(' ')}
          onLoad={handleAnimationLoad}
        />
      )}
    </div>
  );
};

export default Sticker;
