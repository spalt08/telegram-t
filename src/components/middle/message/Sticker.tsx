import React, {
  FC,
  useCallback,
  useState,
  useEffect,
} from '../../../lib/teact/teact';

import { ApiMediaFormat, ApiMessage } from '../../../api/types';

import { getStickerDimensions } from '../../common/helpers/mediaDimensions';
import { getMessageMediaHash, getMessageMediaThumbDataUri } from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';
import useTransitionForMedia from '../../../hooks/useTransitionForMedia';
import buildClassName from '../../../util/buildClassName';
import webpHero from '../../../util/webpHero';

import AnimatedSticker from '../../common/AnimatedSticker';

import './Sticker.scss';

type OwnProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
};

const Sticker: FC<OwnProps> = ({
  message, loadAndPlay,
}) => {
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const handleAnimationLoad = useCallback(() => setIsAnimationLoaded(true), []);

  const sticker = message.content.sticker!;
  const { isAnimated } = sticker;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const mediaData = useMedia(
    sticker.localMediaHash || getMessageMediaHash(message, 'inline'),
    !loadAndPlay,
    isAnimated ? ApiMediaFormat.Lottie : ApiMediaFormat.BlobUrl,
  );
  const isMediaLoaded = Boolean(mediaData);
  const {
    shouldRenderThumb, shouldRenderFullMedia, transitionClassNames,
  } = useTransitionForMedia(isAnimated ? isAnimationLoaded : isMediaLoaded, 'fast', isAnimated);

  useEffect(() => {
    if (shouldRenderThumb) {
      webpHero({
        selectors: `#sticker-thumb-${message.id}`,
      });
    }
  }, [shouldRenderThumb, message.id]);

  useEffect(() => {
    if (!isAnimated && shouldRenderFullMedia) {
      webpHero({
        selectors: `#sticker-${message.id}`,
      });
    }
  }, [isAnimated, shouldRenderFullMedia, message.id]);

  const { width, height } = getStickerDimensions(sticker);
  const thumbClassName = buildClassName('thumbnail', !thumbDataUri && 'empty');

  return (
    <div className="media-inner">
      {shouldRenderThumb && (
        <img
          id={`sticker-thumb-${message.id}`}
          src={thumbDataUri}
          width={width}
          height={height}
          alt=""
          className={thumbClassName}
        />
      )}
      {!isAnimated && shouldRenderFullMedia && (
        <img
          id={`sticker-${message.id}`}
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
