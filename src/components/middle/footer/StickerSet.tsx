import React, {
  FC, memo, useEffect, useMemo,
} from '../../../lib/teact/teact';

import { ApiStickerSet, ApiSticker } from '../../../api/types';
import { GlobalActions } from '../../../global/types';

import useShowTransition from '../../../hooks/useShowTransition';

import StickerButton from './StickerButton';
import { throttle } from '../../../util/schedulers';

type IProps = {
  set: ApiStickerSet;
  shouldLoadStickers: boolean;
  onStickerSelect: (sticker: ApiSticker) => void;
} & Pick<GlobalActions, 'loadStickerSet'>;

const STICKER_ROW_SIZE = 5;
const STICKER_SIZE = 80; // px

const StickerSet: FC<IProps> = ({
  set, shouldLoadStickers, onStickerSelect, loadStickerSet,
}) => {
  const setHeight = Math.ceil(set.count / STICKER_ROW_SIZE) * STICKER_SIZE;

  const { transitionClassNames } = useShowTransition(Boolean(set.stickers.length));

  const loadStickersThrottled = useMemo(() => {
    const throttled = throttle(loadStickerSet, 60000, true);
    return () => { throttled({ id: set.id }); };
  }, [set, loadStickerSet]);

  useEffect(() => {
    if (shouldLoadStickers && set.id !== 'recent' && !set.stickers.length) {
      loadStickersThrottled();
    }
  }, [shouldLoadStickers, set, loadStickersThrottled]);

  return (
    <div
      key={set.id}
      id={`sticker-set-${set.id}`}
      className="symbol-set"
    >
      <p className="symbol-set-name">{set.title}</p>
      <div
        className={['symbol-set-container', ...transitionClassNames].join(' ')}
        // @ts-ignore teact feature
        style={`height: ${setHeight}px`}
      >
        {set.stickers.map((sticker, index) => (
          <StickerButton
            key={sticker.id}
            sticker={sticker}
            top={Math.floor(index / STICKER_ROW_SIZE) * STICKER_SIZE}
            left={(index % STICKER_ROW_SIZE) * STICKER_SIZE}
            onStickerSelect={onStickerSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(StickerSet);
