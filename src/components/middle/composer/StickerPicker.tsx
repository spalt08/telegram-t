import React, {
  FC, useState, useEffect, memo, useRef, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiStickerSet, ApiSticker } from '../../../api/types';

import { MEMO_EMPTY_ARRAY } from '../../../util/memo';
import { throttle } from '../../../util/schedulers';
import { getFirstLetters } from '../../../util/textFormat';
import findInViewport from '../../../util/findInViewport';
import fastSmoothScroll from '../../../util/fastSmoothScroll';
import buildClassName from '../../../util/buildClassName';

import Loading from '../../ui/Loading';
import Button from '../../ui/Button';
import StickerSet from './StickerSet';
import StickerButton from './StickerButton';

import './StickerPicker.scss';

type OwnProps = {
  className: string;
  load: boolean;
  onStickerSelect: (sticker: ApiSticker) => void;
};

type StateProps = {
  recentStickers: ApiSticker[];
  stickerSets: Record<string, ApiStickerSet>;
};

type DispatchProps = Pick<GlobalActions, (
  'loadStickerSets' | 'loadRecentStickers' | 'addRecentSticker' | 'loadStickers'
)>;

type PartialStickerSet = Pick<ApiStickerSet, 'id' | 'title' | 'count' | 'stickers'>;

const SMOOTH_SCROLL_DISTANCE = 500;
// For some reason, parallel `scrollIntoView` executions are conflicting.
const FOOTER_SCROLL_DELAY = 500;
const FOOTER_BUTTON_WIDTH = 60; // px. Includes margins

const runThrottledForScroll = throttle((cb) => cb(), 500, false);

const StickerPicker: FC<OwnProps & StateProps & DispatchProps> = ({
  className,
  load,
  recentStickers,
  stickerSets,
  onStickerSelect,
  loadStickerSets,
  loadRecentStickers,
  loadStickers,
  addRecentSticker,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const footerRef = useRef<HTMLDivElement>();
  const [activeSetIndex, setActiveSetIndex] = useState();
  const [visibleSetIndexes, setVisibleSetIndexes] = useState<number[]>([]);

  const areLoaded = Boolean(Object.keys(stickerSets).length);

  const allSets = useMemo(() => {
    if (!areLoaded) {
      return MEMO_EMPTY_ARRAY;
    }

    const themeSets: PartialStickerSet[] = Object.values(stickerSets);

    if (recentStickers.length) {
      themeSets.unshift({
        id: 'recent',
        title: 'Recently Used',
        stickers: recentStickers,
        count: recentStickers.length,
      });
    }

    return themeSets;
  }, [areLoaded, recentStickers, stickerSets]);

  const updateVisibleSetIndexes = useCallback(() => {
    const { visibleIndexes } = findInViewport(containerRef.current!, '.symbol-set');
    setActiveSetIndex(visibleIndexes[0]);
    setVisibleSetIndexes(visibleIndexes);
  }, []);

  useEffect(() => {
    if (load) {
      loadStickerSets();
      loadRecentStickers();
    }
  }, [load, loadStickerSets, loadRecentStickers]);

  useEffect(() => {
    if (!areLoaded) {
      return undefined;
    }

    updateVisibleSetIndexes();

    const footer = footerRef.current!;

    function scrollFooter(e: WheelEvent) {
      footer.scrollLeft += e.deltaY / 4;
    }

    footer.addEventListener('wheel', scrollFooter, { passive: true });

    return () => {
      footer.removeEventListener('wheel', scrollFooter);
    };
  }, [areLoaded, updateVisibleSetIndexes]);

  // Scroll footer when active set updates
  useEffect(() => {
    if (!areLoaded) {
      return;
    }

    setTimeout(() => {
      const footer = footerRef.current!;
      const newLeft = activeSetIndex * FOOTER_BUTTON_WIDTH - footer.offsetWidth / 2 + FOOTER_BUTTON_WIDTH / 2;

      footer.scrollTo({
        left: newLeft,
        behavior: 'smooth',
      });
    }, FOOTER_SCROLL_DELAY);
  }, [areLoaded, activeSetIndex]);

  const handleStickerSelect = useCallback((sticker: ApiSticker) => {
    onStickerSelect(sticker);
    addRecentSticker({ sticker });
  }, [addRecentSticker, onStickerSelect]);

  const selectSet = useCallback((index: number) => {
    setActiveSetIndex(index);

    const stickerSetEl = document.getElementById(`sticker-set-${allSets[index].id}`)!;
    fastSmoothScroll(containerRef.current!, stickerSetEl, 'start', SMOOTH_SCROLL_DISTANCE);
  }, [allSets]);

  const handleScroll = useCallback(() => {
    runThrottledForScroll(updateVisibleSetIndexes);
  }, [updateVisibleSetIndexes]);

  function renderSetButton(set: PartialStickerSet, index: number) {
    const stickerSetCover = set.stickers[0];
    const buttonClassName = buildClassName(
      'symbol-set-button sticker-set-button',
      index === activeSetIndex && 'activated',
    );

    if (!stickerSetCover || set.id === 'recent') {
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

  if (!areLoaded) {
    return (
      <div className={fullClassName}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={fullClassName}>
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
          />
        ))}
      </div>
      <div
        ref={footerRef}
        className="StickerPicker-footer"
      >
        {allSets.map(renderSetButton)}
      </div>
    </div>
  );
};

export default memo(withGlobal(
  global => {
    const { all, recent } = global.stickers;

    return {
      recentStickers: recent.stickers,
      stickerSets: all.byId,
    };
  },
  (setGlobal, actions) => {
    const {
      loadStickerSets,
      loadRecentStickers,
      loadStickers,
      addRecentSticker,
    } = actions;
    return {
      loadStickerSets,
      loadRecentStickers,
      loadStickers,
      addRecentSticker,
    };
  },
)(StickerPicker));
