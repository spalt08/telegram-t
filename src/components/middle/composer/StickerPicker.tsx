import React, {
  FC, useState, useEffect, memo, useRef, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiStickerSet, ApiSticker } from '../../../api/types';
import { StickerSetOrRecent } from '../../../types';

import { MEMO_EMPTY_ARRAY } from '../../../util/memo';
import { throttle } from '../../../util/schedulers';
import { getFirstLetters } from '../../../util/textFormat';
import findInViewport from '../../../util/findInViewport';
import fastSmoothScroll from '../../../util/fastSmoothScroll';
import buildClassName from '../../../util/buildClassName';
import { pick } from '../../../util/iteratees';

import Loading from '../../ui/Loading';
import Button from '../../ui/Button';
import StickerSet from './StickerSet';
import StickerButton from './StickerButton';

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
  stickerSets: Record<string, ApiStickerSet>;
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
  stickerSets,
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

  const areLoaded = Boolean(Object.keys(stickerSets).length);

  const allSets = useMemo(() => {
    if (!areLoaded) {
      return MEMO_EMPTY_ARRAY;
    }

    const themeSets: StickerSetOrRecent[] = Object.values(stickerSets);

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
  }, [areLoaded, recentStickers, favoriteStickers, stickerSets]);

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
    if (!areLoaded) {
      return undefined;
    }

    updateVisibleSetIndexes();

    const header = headerRef.current!;

    function scrollHeader(e: WheelEvent) {
      header.scrollLeft += e.deltaY / 4;
    }

    header.addEventListener('wheel', scrollHeader, { passive: true });

    return () => {
      header.removeEventListener('wheel', scrollHeader);
    };
  }, [areLoaded, updateVisibleSetIndexes]);

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

  function renderSetButton(set: StickerSetOrRecent, index: number) {
    const stickerSetCover = set.stickers[0];
    const buttonClassName = buildClassName(
      'symbol-set-button sticker-set-button',
      index === activeSetIndex && 'activated',
    );

    if (!stickerSetCover || set.id === 'recent' || set.id === 'favorite') {
      return (
        <Button
          className={buttonClassName}
          onClick={() => selectSet(index)}
          ariaLabel={set.title}
          round
          color="translucent"
        >
          {set.id === 'recent' ? (
            <i className="icon-recent" />
          ) : set.id === 'favorite' ? (
            <i className="icon-favorite" />
          ) : (
            <span className="sticker-set-initial">{getFirstLetters(set.title).slice(0, 2)}</span>
          )}
        </Button>
      );
    }

    return (
      <StickerButton
        sticker={stickerSetCover}
        load
        title={set.title}
        className={buttonClassName}
        onClick={() => selectSet(index)}
      />
    );
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
        {allSets.map(renderSetButton)}
      </div>
      <div
        ref={containerRef}
        className="StickerPicker-main no-scroll"
        onScroll={handleScroll}
      >
        {allSets.map((set, index) => (
          <StickerSet
            set={set}
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
    const { all, recent, favorite } = global.stickers;

    return {
      recentStickers: recent.stickers,
      favoriteStickers: favorite.stickers,
      stickerSets: all.byId,
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
