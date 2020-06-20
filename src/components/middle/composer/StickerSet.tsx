import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiSticker } from '../../../api/types';
import { StickerSetOrRecent } from '../../../types';

import StickerButton from '../../common/StickerButton';

type OwnProps = {
  stickerSet: StickerSetOrRecent;
  load: boolean;
  onStickerSelect: (sticker: ApiSticker) => void;
  onStickerUnfave: (sticker: ApiSticker) => void;
};

const STICKER_ROW_SIZE = 5;
const STICKER_SIZE = 80; // px

const StickerSet: FC<OwnProps> = ({
  stickerSet, load, onStickerSelect, onStickerUnfave,
}) => {
  const stickerSetHeight = Math.ceil(stickerSet.count / STICKER_ROW_SIZE) * STICKER_SIZE;

  return (
    <div
      key={stickerSet.id}
      id={`sticker-set-${stickerSet.id}`}
      className="symbol-set"
    >
      <p className="symbol-set-name">{stickerSet.title}</p>
      <div
        className="symbol-set-container"
        // @ts-ignore teact feature
        style={`height: ${stickerSetHeight}px`}
      >
        {stickerSet.stickers && stickerSet.stickers.map((sticker) => (
          <StickerButton
            key={sticker.id}
            sticker={sticker}
            load={load}
            onClick={onStickerSelect}
            onUnfaveClick={stickerSet.id === 'favorite' ? onStickerUnfave : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(StickerSet);
