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

import Loading from '../../ui/Loading';
import Button from '../../ui/Button';
import StickerSet from './StickerSet';
import StickerButton from './StickerButton';

import './StickerPicker.scss';

type IProps = {
  className: string;
  load: boolean;
  recentStickers: ApiSticker[];
  stickerSets: Record<string, ApiStickerSet>;
  onStickerSelect: (sticker: ApiSticker) => void;
} & Pick<GlobalActions, 'loadStickerSets' | 'loadRecentStickers' | 'addRecentSticker' | 'loadStickers'>;

type PartialStickerSet = Pick<ApiStickerSet, 'id' | 'title' | 'count' | 'stickers'>;

const SMOOTH_SCROLL_DISTANCE = 500;
// For some reason, parallel `scrollIntoView` executions are conflicting.
const FOOTER_SCROLL_DELAY = 500;

const runThrottledForScroll = throttle((cb) => cb(), 500, false);

const StickerPicker: FC<IProps> = ({
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
  const [activeSetIndex, setActiveSetIndex] = useState(0);
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

    const { visibleIndexes } = findInViewport(containerRef.current!, '.symbol-set');
    setVisibleSetIndexes(visibleIndexes);

    const footer = footerRef.current!;

    function scrollFooter(e: WheelEvent) {
      footer.scrollLeft += e.deltaY / 4;
    }

    footer.addEventListener('wheel', scrollFooter, { passive: true });

    return () => {
      footer.removeEventListener('wheel', scrollFooter);
    };
  }, [areLoaded]);

  // Scroll footer when active set updates
  useEffect(() => {
    if (!areLoaded) {
      return;
    }

    setTimeout(() => {
      const footer = footerRef.current!;
      const selector = `.sticker-set-button:nth-child(${activeSetIndex + 1})`;
      const activeSetButton = footer.querySelector(selector) as HTMLButtonElement;

      if (!activeSetButton) {
        return;
      }

      footer.scrollTo({
        left: activeSetButton.offsetLeft - footer.offsetWidth / 2 + activeSetButton.offsetWidth / 2,
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
    runThrottledForScroll(() => {
      const { visibleIndexes } = findInViewport(containerRef.current!, '.symbol-set');
      setActiveSetIndex(visibleIndexes[0]);
      setVisibleSetIndexes(visibleIndexes);
    });
  }, []);

  function renderSetButton(set: PartialStickerSet, index: number) {
    const stickerSetCover = set.stickers[0];
    const buttonClassName = `symbol-set-button sticker-set-button ${index === activeSetIndex ? 'activated' : ''}`;

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
        className={buttonClassName}
        sticker={stickerSetCover}
        title={set.title}
        onClick={() => selectSet(index)}
      />
    );
  }

  if (!areLoaded) {
    return (
      <div className={`StickerPicker ${className || ''}`}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={`StickerPicker ${className || ''}`}>
      <div
        ref={containerRef}
        className="StickerPicker-main custom-scroll"
        onScroll={handleScroll}
      >
        {allSets.map((set, index) => (
          <StickerSet
            set={set}
            loadAndShow={visibleSetIndexes.includes(index)}
            loadStickers={loadStickers}
            onStickerSelect={handleStickerSelect}
          />
        ))}
      </div>
      <div
        ref={footerRef}
        className="StickerMenu-footer StickerPicker-footer"
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
