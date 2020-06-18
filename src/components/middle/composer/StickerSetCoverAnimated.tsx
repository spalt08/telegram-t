import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiMediaFormat, ApiStickerSet } from '../../../api/types';

import useMedia from '../../../hooks/useMedia';
import useTransitionForMedia from '../../../hooks/useTransitionForMedia';
import { getFirstLetters } from '../../../util/textFormat';

import AnimatedSticker from '../../common/AnimatedSticker';

type OwnProps = {
  stickerSet: ApiStickerSet;
};

const StickerSetCoverAnimated: FC<OwnProps> = ({ stickerSet }) => {
  const lottieData = useMedia(`stickerSet${stickerSet.id}`, undefined, ApiMediaFormat.Lottie);
  const { shouldRenderFullMedia, transitionClassNames } = useTransitionForMedia(lottieData, 'slow');

  return (
    <div className="sticker-set-cover">
      {getFirstLetters(stickerSet.title).slice(0, 2)}
      {shouldRenderFullMedia && lottieData && (
        <AnimatedSticker animationData={lottieData} className={transitionClassNames} />
      )}
    </div>
  );
};

export default memo(StickerSetCoverAnimated);
