import { WheelEvent } from 'react';
import React, {
  FC, useState, useEffect, memo, useRef, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiStickerSet, ApiSticker } from '../../../api/types';
import { throttle } from '../../../util/schedulers';
import { getFirstLetters } from '../../../util/textFormat';
import determineVisibleSymbolSet from '../util/determineVisibleSymbolSet';

import Loading from '../../ui/Loading';
import Button from '../../ui/Button';
import StickerSet from './StickerSet';
import StickerButton from './StickerButton';

import './StickerPicker.scss';

type IProps = {
  className: string;
  recentStickers: ApiSticker[];
  stickerSets: Record<string, ApiStickerSet>;
  onStickerSelect: (sticker: ApiSticker) => void;
} & Pick<GlobalActions, 'loadStickers' | 'loadRecentStickers' | 'addRecentSticker' | 'loadStickerSet'>;

type PartialStickerSet = Pick<ApiStickerSet, 'id' | 'title' | 'count' | 'stickers'>;

let isScrollingProgrammatically = false;

const runThrottledForScroll = throttle((cb) => cb(), 100, false);

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
        const visibleSet = determineVisibleSymbolSet(containerRef.current);
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

  const handleFooterScroll = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (!footerRef.current) {
        return;
      }

      footerRef.current.scrollLeft += e.deltaY / 4;
    },
    [footerRef],
  );

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
    const setCover = set.stickers[0];
    if (!setCover || set.id === 'recent') {
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
            <span className="sticker-set-initial">{getFirstLetters(set.title).slice(0, 2)}</span>
          )}
        </Button>
      );
    }

    return (
      <StickerButton
        className={`symbol-set-button sticker-set-button ${set.id === currentSet ? 'activated' : ''}`}
        setButton
        sticker={setCover}
        title={set.title}
        onStickerSelect={() => selectSet(set.id)}
      />
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
        onWheel={handleFooterScroll}
      >
        {allStickerSets.map(renderStickerSetButton)}
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
