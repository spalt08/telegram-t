import React, { FC } from '../../../lib/teact/teact';

import { ApiSticker } from '../../../api/types';
import { getStickerDimensions } from '../../../util/imageDimensions';
import AnimatedSticker from '../../common/AnimatedSticker';

import './Sticker.scss';

type IProps = {
  sticker: ApiSticker;
  mediaData?: string | AnyLiteral;
  loadAndPlayMedia?: boolean;
};

const Sticker: FC<IProps> = ({
  sticker, mediaData, loadAndPlayMedia,
}) => {
  const { thumbnail, is_animated } = sticker;
  const { width, height } = getStickerDimensions(sticker);
  const thumbData = thumbnail && thumbnail.dataUri;

  let thumbClassName = 'thumbnail';
  if (thumbData && is_animated && mediaData) {
    thumbClassName += ' fade-out';
  } else if (!thumbData) {
    thumbClassName += ' empty';
  }

  return (
    <div className="media-inner">
      <img
        src={thumbData}
        width={width}
        height={height}
        alt=""
        className={thumbClassName}
      />
      {!is_animated && (
        <img
          src={mediaData as string}
          width={width}
          height={height}
          alt=""
          className={mediaData ? 'full-media fade-in' : 'full-media'}
        />
      )}
      {is_animated && (
        <AnimatedSticker
          animationData={mediaData as AnyLiteral}
          width={width}
          height={height}
          play={loadAndPlayMedia}
          className={mediaData ? 'full-media fade-in' : 'full-media'}
        />
      )}
    </div>
  );
};

export default Sticker;
