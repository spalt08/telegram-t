import React, { FC, memo, useEffect } from '../../../lib/teact/teact';

import { ApiStickerSet, ApiSticker } from '../../../api/types';
import { GlobalActions } from '../../../global/types';

import useShowTransition from '../../../hooks/useShowTransition';
import buildClassName from '../../../util/buildClassName';

import StickerButton from './StickerButton';

type IProps = {
  set: ApiStickerSet;
  loadAndShow: boolean;
  onStickerSelect: (sticker: ApiSticker) => void;
} & Pick<GlobalActions, 'loadStickers'>;

const STICKER_ROW_SIZE = 5;
const STICKER_SIZE = 80; // px

const StickerSet: FC<IProps> = ({
  set, loadAndShow, loadStickers, onStickerSelect,
}) => {
  const areLoaded = Boolean(set.stickers.length);
  const stickerSetHeight = Math.ceil(set.count / STICKER_ROW_SIZE) * STICKER_SIZE;

  useEffect(() => {
    if (!areLoaded && loadAndShow) {
      loadStickers({ stickerSetId: set.id });
    }
  }, [areLoaded, loadAndShow, loadStickers, set.id]);

  const { transitionClassNames } = useShowTransition(areLoaded && loadAndShow);

  return (
    <div
      key={set.id}
      id={`sticker-set-${set.id}`}
      className="symbol-set"
    >
      <p className="symbol-set-name">{set.title}</p>
      <div
        className={buildClassName('symbol-set-container overlay', transitionClassNames)}
        // @ts-ignore teact feature
        style={`height: ${stickerSetHeight}px`}
      >
        {set.stickers.map((sticker, index) => (
          <StickerButton
            key={sticker.id}
            sticker={sticker}
            top={Math.floor(index / STICKER_ROW_SIZE) * STICKER_SIZE}
            left={(index % STICKER_ROW_SIZE) * STICKER_SIZE}
            onClick={onStickerSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(StickerSet);
