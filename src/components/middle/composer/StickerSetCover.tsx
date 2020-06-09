import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiStickerSet } from '../../../api/types';

import useMedia from '../../../hooks/useMedia';
import useTransitionForMedia from '../../../hooks/useTransitionForMedia';
import { getFirstLetters } from '../../../util/textFormat';

type OwnProps = {
  stickerSet: ApiStickerSet;
};

const StickerSetCover: FC<OwnProps> = ({ stickerSet }) => {
  const mediaData = useMedia(stickerSet.hasThumbnail && `stickerSet${stickerSet.id}`);
  const { shouldRenderFullMedia, transitionClassNames } = useTransitionForMedia(mediaData, 'slow');

  return (
    <div className="sticker-set-cover">
      {getFirstLetters(stickerSet.title).slice(0, 2)}
      {shouldRenderFullMedia && (
        <img src={mediaData} className={transitionClassNames} alt="" />
      )}
    </div>
  );
};

export default memo(StickerSetCover);
