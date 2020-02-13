import { MouseEvent as ReactMouseEvent } from 'react';
import React, {
  FC, useState, useEffect, memo, useRef, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiStickerSet, ApiSticker } from '../../../api/types';
import { throttle } from '../../../util/schedulers';

import Loading from '../../ui/Loading';
import StickerSet from './StickerSet';

import './StickerPicker.scss';
import Button from '../../ui/Button';

type IProps = {
  className: string;
  recentStickers: ApiSticker[];
  stickerSets: Record<string, ApiStickerSet>;
  onStickerSelect: (sticker: ApiSticker) => void;
} & Pick<GlobalActions, 'loadStickers' | 'loadRecentStickers' | 'addRecentSticker' | 'loadStickerSet'>;

type PartialStickerSet = Pick<ApiStickerSet, 'id' | 'title' | 'count' | 'stickers'>;

let isScrollingProgrammatically = false;
let isDown = false;
let startX: number;
let scrollLeft: number = 0;

const runThrottledForScroll = throttle((cb) => cb(), 100, false);
const VIEWPORT_MARGIN = 100;

const StickerPicker: FC<IProps> = ({
  className,
  recentStickers,
  stickerSets,
  onStickerSelect,
  loadStickers,
  loadRecentStickers,
  loadStickerSet,
  addRecentSticker,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSet, setCurrentSet] = useState('recent');
  const containerRef = useRef<HTMLDivElement>();
  const footerRef = useRef<HTMLDivElement>();

  const loadStickersThrottled = useMemo(() => {
    const throttled = throttle(loadStickers, 2500, true);
    return () => { throttled(); };
  }, [loadStickers]);

  const loadRecentStickersThrottled = useMemo(() => {
    const throttled = throttle(loadRecentStickers, 2500, true);
    return () => { throttled(); };
  }, [loadRecentStickers]);

  useEffect(() => {
    loadStickersThrottled();
    loadRecentStickersThrottled();
  }, [className, loadStickersThrottled, loadRecentStickersThrottled]);

  useEffect(() => {
    if (isLoading && Object.keys(stickerSets).length) {
      setIsLoading(false);
    }
  }, [isLoading, stickerSets]);

  const handleStickerSelect = useCallback((sticker: ApiSticker) => {
    onStickerSelect(sticker);
    addRecentSticker({ sticker });
  }, [addRecentSticker, onStickerSelect]);

  const scrollToCurrentSetButton = useCallback(() => {
    if (!footerRef.current) {
      return;
    }

    const visibleSetEl = footerRef.current.querySelector('.sticker-set-button.activated') as HTMLButtonElement;
    if (visibleSetEl) {
      footerRef.current.scrollTo({
        left: visibleSetEl.offsetLeft - footerRef.current.offsetWidth / 2 + visibleSetEl.offsetWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [footerRef]);

  const selectSet = useCallback((setId: string) => {
    if (currentSet === setId) {
      return;
    }

    setCurrentSet(setId);
    const setEl = document.getElementById(`sticker-set-${setId}`);
    if (setEl) {
      isScrollingProgrammatically = true;
      setEl.scrollIntoView();
      requestAnimationFrame(() => {
        isScrollingProgrammatically = false;
        scrollToCurrentSetButton();
      });
    }
  }, [currentSet, scrollToCurrentSetButton]);

  const handleScroll = useCallback(
    () => {
      if (isScrollingProgrammatically) {
        return;
      }

      runThrottledForScroll(() => {
        if (!containerRef.current) {
          return;
        }
        const visibleSet = determineVisibleSet(containerRef.current);
        if (visibleSet && visibleSet !== currentSet) {
          setCurrentSet(visibleSet);
          requestAnimationFrame(() => {
            scrollToCurrentSetButton();
          });
        }
      });
    },
    [containerRef, currentSet, scrollToCurrentSetButton],
  );

  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!footerRef.current) {
      return;
    }
    isDown = true;
    startX = e.pageX - footerRef.current.offsetLeft;
    scrollLeft = footerRef.current.scrollLeft;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDown = false;
  }, []);

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isDown || !footerRef.current) {
      return;
    }
    e.preventDefault();
    const x = e.pageX - footerRef.current.offsetLeft;
    const walk = (x - startX) * 3;
    footerRef.current.scrollLeft = scrollLeft - walk;
  }, []);

  const allStickerSets = useMemo(() => {
    const allSets: PartialStickerSet[] = Object.values(stickerSets);

    if (recentStickers.length) {
      allSets.unshift({
        id: 'recent',
        title: 'Recently Used',
        stickers: recentStickers,
        count: recentStickers.length,
      });
    }

    return allSets;
  }, [stickerSets, recentStickers]);

  function renderStickerSetButton(set: PartialStickerSet) {
    return (
      <Button
        className={`symbol-set-button sticker-set-button ${set.id === currentSet ? 'activated' : ''}`}
        round
        color="translucent"
        onClick={() => selectSet(set.id)}
        ariaLabel={set.title}
      >
        {set.id === 'recent' ? (
          <i className="icon-recent" />
        ) : (
          // Temp
          <i className="icon-smile" />
        )}
      </Button>
    );
  }

  const shouldLoadStickers = useCallback((targetIndex: number) => {
    const visibleIndex = allStickerSets.findIndex((s) => s.id === currentSet);
    const previousIndex = visibleIndex > 0 ? visibleIndex - 1 : visibleIndex;
    const nextIndex = visibleIndex < allStickerSets.length ? visibleIndex + 1 : visibleIndex;

    return targetIndex >= previousIndex && targetIndex <= nextIndex;
  }, [allStickerSets, currentSet]);

  if (isLoading) {
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
        {allStickerSets.map((set, index) => (
          <StickerSet
            set={set}
            onStickerSelect={handleStickerSelect}
            loadStickerSet={loadStickerSet}
            shouldLoadStickers={shouldLoadStickers(index)}
          />
        ))}
      </div>
      <div
        ref={footerRef}
        className="StickerMenu-footer StickerPicker-footer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {allStickerSets.map(renderStickerSetButton)}
      </div>
    </div>
  );
};

function determineVisibleSet(container: HTMLElement) {
  const allElements = container.querySelectorAll('.symbol-set');
  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;

  const firstVisibleElement = Array.from(allElements).find((el) => {
    const currentTop = (el as HTMLElement).offsetTop;
    const currentBottom = currentTop + (el as HTMLElement).offsetHeight;
    return currentTop <= containerBottom - VIEWPORT_MARGIN && currentBottom >= containerTop + VIEWPORT_MARGIN;
  });

  if (!firstVisibleElement) {
    return undefined;
  }

  const n = firstVisibleElement.id.lastIndexOf('-');
  return firstVisibleElement.id.substring(n + 1);
}

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
      loadStickers,
      loadRecentStickers,
      loadStickerSet,
      addRecentSticker,
    } = actions;
    return {
      loadStickers,
      loadRecentStickers,
      loadStickerSet,
      addRecentSticker,
    };
  },
)(StickerPicker));
