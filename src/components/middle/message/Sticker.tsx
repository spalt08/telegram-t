import React, { FC, useCallback, useState } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getStickerDimensions } from '../../../util/mediaDimensions';
import { getMessageMediaHash, getMessageMediaThumbDataUri } from '../../../modules/helpers';
import * as mediaLoader from '../../../util/mediaLoader';
import useMedia from '../../../hooks/useMedia';

import AnimatedSticker from '../../common/AnimatedSticker';

import './Sticker.scss';
import useShowTransition from '../../../hooks/useShowTransition';

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
    getMessageMediaHash(message, 'inline'),
    !loadAndPlay,
    isAnimated ? mediaLoader.Type.Lottie : mediaLoader.Type.BlobUrl,
  );

  const {
    shouldRender: shouldFullMediaRender,
    transitionClassNames: fullMediaClassNames,
  } = useShowTransition(isAnimated ? isAnimationLoaded : mediaData);

  const { width, height } = getStickerDimensions(sticker);

  let thumbClassName = 'thumbnail';
  if (thumbDataUri && isAnimationLoaded && fullMediaClassNames.includes('open')) {
    thumbClassName += ' fade-out';
  } else if (!thumbDataUri) {
    thumbClassName += ' empty';
  }

  return (
    <div className="media-inner">
      <img
        src={thumbDataUri}
        width={width}
        height={height}
        alt=""
        className={thumbClassName}
      />
      {(!isAnimated && shouldFullMediaRender) && (
        <img
          src={mediaData as string}
          width={width}
          height={height}
          alt=""
          className={['full-media', ...fullMediaClassNames].join(' ')}
        />
      )}
      {isAnimated && mediaData && (
        <AnimatedSticker
          animationData={mediaData as AnyLiteral}
          width={width}
          height={height}
          play={loadAndPlay}
          className={['full-media', ...fullMediaClassNames].join(' ')}
          onLoad={handleAnimationLoad}
        />
      )}
    </div>
  );
};

export default Sticker;
