import React, {
  FC, useEffect, memo, useMemo, useCallback,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiStickerSet, ApiSticker } from '../../api/types';
import { GlobalActions } from '../../global/types';

import { pick } from '../../util/iteratees';

import Button from '../ui/Button';
import StickerButton from '../common/StickerButton';
import { selectStickerSet } from '../../modules/selectors';

type OwnProps = {
  stickerSetId: string;
  canSendStickers?: boolean;
};

type StateProps = {
  set?: ApiStickerSet;
};

type DispatchProps = Pick<GlobalActions, 'loadStickers' | 'sendMessage' | 'toggleStickerSet'>;

const STICKERS_TO_DISPLAY = 5;

const StickerSetResult: FC<OwnProps & StateProps & DispatchProps> = ({
  stickerSetId, set, canSendStickers, loadStickers, sendMessage, toggleStickerSet,
}) => {
  const isAdded = set && Boolean(set.installedDate);
  const areStickersLoaded = Boolean(set && set.stickers.length);

  const displayedStickers = useMemo(() => {
    if (!set) {
      return [];
    }

    const coverStickerIds = (set.covers || []).map(({ id }) => id);
    const otherStickers = set.stickers.filter(({ id }) => !coverStickerIds.includes(id));

    return [...set.covers || [], ...otherStickers].slice(0, STICKERS_TO_DISPLAY);
  }, [set]);

  useEffect(() => {
    if (!areStickersLoaded && displayedStickers.length < STICKERS_TO_DISPLAY) {
      loadStickers({ stickerSetId });
    }
  }, [areStickersLoaded, displayedStickers.length, loadStickers, stickerSetId]);

  const handleAddClick = useCallback(() => {
    toggleStickerSet({ stickerSetId });
  }, [toggleStickerSet, stickerSetId]);

  const handleStickerSelect = useCallback((sticker: ApiSticker) => {
    if (!canSendStickers) {
      return;
    }
    sendMessage({ sticker });
  }, [canSendStickers, sendMessage]);

  if (!set) {
    return undefined;
  }


  return (
    <div key={set.id} className="sticker-set">
      <div className="sticker-set-header">
        <div>
          <h3 className="title">{set.title}</h3>
          <p className="count">{set.count} stickers</p>
        </div>
        <Button
          className={isAdded ? 'is-added' : undefined}
          color="primary"
          size="tiny"
          pill
          fluid
          onClick={handleAddClick}
        >
          {isAdded ? 'Added' : 'Add'}
        </Button>
      </div>
      <div className="sticker-set-main">
        {displayedStickers.map((sticker) => (
          <StickerButton sticker={sticker} load onClick={() => handleStickerSelect(sticker)} />
        ))}
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { stickerSetId }): StateProps => {
    return {
      set: selectStickerSet(global, stickerSetId),
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadStickers', 'sendMessage', 'toggleStickerSet']),
)(StickerSetResult));
