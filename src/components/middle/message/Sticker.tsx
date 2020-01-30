import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getStickerDimensions } from '../../../util/mediaDimensions';
import { getMessageMediaHash, getMessageMediaThumbDataUri } from '../../../modules/helpers';
import * as mediaLoader from '../../../util/mediaLoader';
import useMedia from '../../../hooks/useMedia';

import AnimatedSticker from '../../common/AnimatedSticker';

import './Sticker.scss';

type IProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
};

const Sticker: FC<IProps> = ({
  message, loadAndPlay,
}) => {
  const sticker = message.content.sticker!;
  const isAnimated = sticker.is_animated;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const mediaData = useMedia(
    getMessageMediaHash(message, 'inline'),
    !loadAndPlay,
    isAnimated ? mediaLoader.Type.Lottie : mediaLoader.Type.BlobUrl,
  );

  const { width, height } = getStickerDimensions(sticker);

  let thumbClassName = 'thumbnail';
  if (thumbDataUri && isAnimated && mediaData) {
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
      {!isAnimated && (
        <img
          src={mediaData as string}
          width={width}
          height={height}
          alt=""
          className={mediaData ? 'full-media fade-in' : 'full-media'}
        />
      )}
      {isAnimated && (
        <AnimatedSticker
          animationData={mediaData as AnyLiteral}
          width={width}
          height={height}
          play={loadAndPlay}
          className={mediaData ? 'full-media fade-in' : 'full-media'}
        />
      )}
    </div>
  );
};

export default Sticker;
