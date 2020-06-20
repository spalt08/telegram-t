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
  stickerSetsById: Record<string, ApiStickerSet>;
  addedSetIds?: string[];
};

type DispatchProps = Pick<GlobalActions, (
  'loadStickerSets' | 'loadRecentStickers' | 'loadFavoriteStickers' |
  'addRecentSticker' | 'loadAddedStickers' | 'unfaveSticker'
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
  loadAddedStickers,
  addRecentSticker,
  unfaveSticker,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const headerRef = useRef<HTMLDivElement>();
  const [activeSetIndex, setActiveSetIndex] = useState<number>();
  const [visibleSetIndexes, setVisibleSetIndexes] = useState<number[]>([]);

  const areAddedLoaded = Boolean(addedSetIds);

  const allSets = useMemo(() => {
    if (!areAddedLoaded) {
      return MEMO_EMPTY_ARRAY;
    }

    const themeSets: StickerSetOrRecent[] = addedSetIds
      ? addedSetIds.map((id) => stickerSetsById[id]).filter(Boolean)
      : [];

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
  }, [areAddedLoaded, addedSetIds, recentStickers, favoriteStickers, stickerSetsById]);

  const updateVisibleSetIndexes = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const { visibleIndexes } = findInViewport(containerRef.current, '.symbol-set');
    setActiveSetIndex(visibleIndexes[0]);
    setVisibleSetIndexes(visibleIndexes);
  }, []);

  useEffect(() => {
    if (load) {
      loadStickerSets();
      loadRecentStickers();
      loadFavoriteStickers();
    }
  }, [load, loadFavoriteStickers, loadRecentStickers, loadStickerSets]);

  useEffect(() => {
    if (addedSetIds && addedSetIds.length) {
      loadAddedStickers();
    }
  }, [addedSetIds, loadAddedStickers]);

  useEffect(() => {
    if (areAddedLoaded) {
      updateVisibleSetIndexes();
    }
  }, [areAddedLoaded, updateVisibleSetIndexes]);

  useHorizontalScroll(headerRef);

  // Scroll header when active set updates
  useEffect(() => {
    if (!areAddedLoaded) {
      return;
    }

    setTimeout(() => {
      const header = headerRef.current;
      if (!header) {
        return;
      }

      const newLeft = activeSetIndex * HEADER_BUTTON_WIDTH - header.offsetWidth / 2 + HEADER_BUTTON_WIDTH / 2;

      header.scrollTo({
        left: newLeft,
        behavior: 'smooth',
      });
    }, HEADER_SCROLL_DELAY);
  }, [areAddedLoaded, activeSetIndex]);

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
          faded={stickerSet.id === 'recent' || stickerSet.id === 'favorite'}
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

  if (!areAddedLoaded || !canSendStickers) {
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
        className="StickerPicker-header no-selection"
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
      stickerSetsById: setsById,
      addedSetIds: added.setIds,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'loadStickerSets',
    'loadRecentStickers',
    'loadFavoriteStickers',
    'loadAddedStickers',
    'addRecentSticker',
    'unfaveSticker',
  ]),
)(StickerPicker));
