import React, { FC, memo, useEffect } from '../../../lib/teact/teact';

import { GlobalActions } from '../../../global/types';
import { ApiSticker } from '../../../api/types';
import { StickerSetOrRecent } from '../../../types';

import StickerButton from './StickerButton';

type OwnProps = {
  set: StickerSetOrRecent;
  load: boolean;
  onStickerSelect: (sticker: ApiSticker) => void;
  onStickerUnfave: (sticker: ApiSticker) => void;
} & Pick<GlobalActions, 'loadStickers'>;

const STICKER_ROW_SIZE = 5;
const STICKER_SIZE = 80; // px

const StickerSet: FC<OwnProps> = ({
  set, load, loadStickers, onStickerSelect, onStickerUnfave,
}) => {
  const areLoaded = Boolean(set.stickers.length);
  const stickerSetHeight = Math.ceil(set.count / STICKER_ROW_SIZE) * STICKER_SIZE;

  useEffect(() => {
    if (!areLoaded && load) {
      loadStickers({ stickerSetId: set.id });
    }
  }, [areLoaded, load, loadStickers, set.id]);

  return (
    <div
      key={set.id}
      id={`sticker-set-${set.id}`}
      className="symbol-set"
    >
      <p className="symbol-set-name">{set.title}</p>
      <div
        className="symbol-set-container"
        // @ts-ignore teact feature
        style={`height: ${stickerSetHeight}px`}
      >
        {set.stickers.map((sticker) => (
          <StickerButton
            key={sticker.id}
            sticker={sticker}
            load={load}
            onClick={onStickerSelect}
            onUnfaveClick={set.id === 'favorite' ? onStickerUnfave : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(StickerSet);
