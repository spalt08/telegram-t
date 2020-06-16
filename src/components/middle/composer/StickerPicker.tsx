import React, {
  FC, useState, useEffect, memo, useRef, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiStickerSet, ApiSticker } from '../../../api/types';
import { StickerSetOrRecent } from '../../../types';

import { MEMO_EMPTY_ARRAY } from '../../../util/memo';
import { throttle } from '../../../util/schedulers';
import findInViewport from '../../../util/findInViewport';
import fastSmoothScroll from '../../../util/fastSmoothScroll';
import buildClassName from '../../../util/buildClassName';
import { pick } from '../../../util/iteratees';
import useHorizontalScroll from '../../../hooks/useHorizontalScroll';

import Loading from '../../ui/Loading';
import Button from '../../ui/Button';
import StickerButton from '../../common/StickerButton';
import StickerSet from './StickerSet';
import StickerSetCover from './StickerSetCover';
import StickerSetCoverAnimated from './StickerSetCoverAnimated';

import './StickerPicker.scss';

type OwnProps = {
  className: string;
  load: boolean;
  canSendStickers: boolean;
  onStickerSelect: (sticker: ApiSticker) => void;
};

type StateProps = {
  recentStickers: ApiSticker[];
  favoriteStickers: ApiSticker[];
  addedSetIds: string[];
  stickerSetsById: Record<string, ApiStickerSet>;
};

type DispatchProps = Pick<GlobalActions, (
  'loadStickerSets' | 'loadRecentStickers' | 'loadFavoriteStickers' |
  'addRecentSticker' | 'loadStickers' | 'unfaveSticker'
)>;

const SMOOTH_SCROLL_DISTANCE = 500;
// For some reason, parallel `scrollIntoView` executions are conflicting.
const HEADER_SCROLL_DELAY = 500;
const HEADER_BUTTON_WIDTH = 60; // px. Includes margins

const runThrottledForScroll = throttle((cb) => cb(), 500, false);

const StickerPicker: FC<OwnProps & StateProps & DispatchProps> = ({
  className,
  load,
  canSendStickers,
  recentStickers,
  favoriteStickers,
  addedSetIds,
  stickerSetsById,
  onStickerSelect,
  loadStickerSets,
  loadRecentStickers,
  loadFavoriteStickers,
  loadStickers,
  addRecentSticker,
  unfaveSticker,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const headerRef = useRef<HTMLDivElement>();
  const [activeSetIndex, setActiveSetIndex] = useState<number>();
  const [visibleSetIndexes, setVisibleSetIndexes] = useState<number[]>([]);

  const areLoaded = Boolean(addedSetIds.length && Object.keys(stickerSetsById).length);

  const allSets = useMemo(() => {
    if (!areLoaded) {
      return MEMO_EMPTY_ARRAY;
    }

    const themeSets: StickerSetOrRecent[] = addedSetIds.map((id) => stickerSetsById[id]).filter(Boolean);

    if (favoriteStickers.length) {
      themeSets.unshift({
        id: 'favorite',
        title: 'Favorites',
        stickers: favoriteStickers,
        count: favoriteStickers.length,
      });
    }

    if (recentStickers.length) {
      themeSets.unshift({
        id: 'recent',
        title: 'Recently Used',
        stickers: recentStickers,
        count: recentStickers.length,
      });
    }

    return themeSets;
  }, [areLoaded, addedSetIds, recentStickers, favoriteStickers, stickerSetsById]);

  const updateVisibleSetIndexes = useCallback(() => {
    const { visibleIndexes } = findInViewport(containerRef.current!, '.symbol-set');
    setActiveSetIndex(visibleIndexes[0]);
    setVisibleSetIndexes(visibleIndexes);
  }, []);

  useEffect(() => {
    if (load) {
      loadStickerSets();
      loadRecentStickers();
      loadFavoriteStickers();
    }
  }, [load, loadStickerSets, loadRecentStickers, loadFavoriteStickers]);

  useEffect(() => {
    if (areLoaded) {
      updateVisibleSetIndexes();
    }
  }, [areLoaded, updateVisibleSetIndexes]);

  useHorizontalScroll(headerRef.current);

  // Scroll header when active set updates
  useEffect(() => {
    if (!areLoaded) {
      return;
    }

    setTimeout(() => {
      const header = headerRef.current!;
      const newLeft = activeSetIndex * HEADER_BUTTON_WIDTH - header.offsetWidth / 2 + HEADER_BUTTON_WIDTH / 2;

      header.scrollTo({
        left: newLeft,
        behavior: 'smooth',
      });
    }, HEADER_SCROLL_DELAY);
  }, [areLoaded, activeSetIndex]);

  const handleStickerSelect = useCallback((sticker: ApiSticker) => {
    onStickerSelect(sticker);
    addRecentSticker({ sticker });
  }, [addRecentSticker, onStickerSelect]);

  const handleStickerUnfave = useCallback((sticker: ApiSticker) => {
    unfaveSticker({ sticker });
  }, [unfaveSticker]);

  const selectSet = useCallback((index: number) => {
    setActiveSetIndex(index);

    const stickerSetEl = document.getElementById(`sticker-set-${allSets[index].id}`)!;
    fastSmoothScroll(containerRef.current!, stickerSetEl, 'start', SMOOTH_SCROLL_DISTANCE);
  }, [allSets]);

  const handleScroll = useCallback(() => {
    runThrottledForScroll(updateVisibleSetIndexes);
  }, [updateVisibleSetIndexes]);

  function renderCover(stickerSet: StickerSetOrRecent, index: number) {
    const firstSticker = stickerSet.stickers[0];
    const buttonClassName = buildClassName(
      'symbol-set-button sticker-set-button',
      index === activeSetIndex && 'activated',
    );

    if (stickerSet.id === 'recent' || stickerSet.id === 'favorite' || stickerSet.hasThumbnail || !firstSticker) {
      return (
        <Button
          className={buttonClassName}
          onClick={() => selectSet(index)}
          ariaLabel={stickerSet.title}
          round
          color="translucent"
        >
          {stickerSet.id === 'recent' ? (
            <i className="icon-recent" />
          ) : stickerSet.id === 'favorite' ? (
            <i className="icon-favorite" />
          ) : stickerSet.isAnimated ? (
            <StickerSetCoverAnimated stickerSet={stickerSet as ApiStickerSet} />
          ) : (
            <StickerSetCover stickerSet={stickerSet as ApiStickerSet} />
          )}
        </Button>
      );
    } else {
      return (
        <StickerButton
          sticker={firstSticker}
          load
          title={stickerSet.title}
          className={buttonClassName}
          onClick={() => selectSet(index)}
        />
      );
    }
  }

  const fullClassName = buildClassName('StickerPicker', className);

  if (!areLoaded || !canSendStickers) {
    return (
      <div className={fullClassName}>
        {!canSendStickers ? (
          <div className="picker-disabled">Sending stickers is not allowed in this chat.</div>
        ) : (
          <Loading />
        )}
      </div>
    );
  }

  return (
    <div className={fullClassName}>
      <div
        ref={headerRef}
        className="StickerPicker-header"
      >
        {allSets.map(renderCover)}
      </div>
      <div
        ref={containerRef}
        className="StickerPicker-main no-scroll"
        onScroll={handleScroll}
      >
        {allSets.map((stickerSet, index) => (
          <StickerSet
            stickerSet={stickerSet}
            load={visibleSetIndexes.includes(index)}
            loadStickers={loadStickers}
            onStickerSelect={handleStickerSelect}
            onStickerUnfave={handleStickerUnfave}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const {
      setsById,
      added,
      recent,
      favorite,
    } = global.stickers;

    return {
      recentStickers: recent.stickers,
      favoriteStickers: favorite.stickers,
      addedSetIds: added.setIds,
      stickerSetsById: setsById,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'loadStickerSets',
    'loadRecentStickers',
    'loadFavoriteStickers',
    'loadStickers',
    'addRecentSticker',
    'unfaveSticker',
  ]),
)(StickerPicker));
