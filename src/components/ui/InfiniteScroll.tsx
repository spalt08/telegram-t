import { RefObject, UIEvent } from 'react';
import { LoadMoreDirection } from '../../types';

import React, {
  FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef,
} from '../../lib/teact/teact';

import { IS_TOUCH_ENV } from '../../util/environment';
import { debounce } from '../../util/schedulers';
import setScrollTop from '../../util/setScrollTop';

type OwnProps = {
  ref?: RefObject<HTMLDivElement>;
  className?: string;
  onLoadMore?: ({ direction }: { direction: LoadMoreDirection }) => void;
  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
  items?: any[];
  itemSelector?: string;
  preloadBackwards?: number;
  sensitiveArea?: number;
  noFastList?: boolean;
  children: any;
};

const DEFAULT_LIST_SELECTOR = '.ListItem';
const DEFAULT_PRELOAD_BACKWARDS = 20;
const DEFAULT_SENSITIVE_AREA = 1200;

const SCROLL_DEBOUNCE_ARGS = IS_TOUCH_ENV ? [700, false, true] : [1000, true, false];

const InfiniteScroll: FC<OwnProps> = ({
  ref,
  className,
  onLoadMore,
  onScroll,
  items,
  itemSelector = DEFAULT_LIST_SELECTOR,
  preloadBackwards = DEFAULT_PRELOAD_BACKWARDS,
  sensitiveArea = DEFAULT_SENSITIVE_AREA,
  noFastList,
  children,
}: OwnProps) => {
  let containerRef = useRef<HTMLDivElement>();
  if (ref) {
    containerRef = ref;
  }

  const stateRef = useRef<{
    listItemElements: NodeListOf<HTMLDivElement>;
    isScrollTopJustUpdated: boolean;
    currentAnchor: HTMLDivElement | undefined;
    currentAnchorTop: number;
  }>({} as any);

  const [loadMoreBackwards, loadMoreForwards] = useMemo(() => {
    if (!onLoadMore) {
      return [];
    }

    return [
      // @ts-ignore
      debounce(() => onLoadMore({ direction: LoadMoreDirection.Backwards }), ...SCROLL_DEBOUNCE_ARGS),
      // @ts-ignore
      debounce(() => onLoadMore({ direction: LoadMoreDirection.Forwards }), ...SCROLL_DEBOUNCE_ARGS),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLoadMore, items]);

  // Initial preload
  useEffect(() => {
    if (!loadMoreBackwards) {
      return;
    }

    if (!items || items.length < preloadBackwards) {
      loadMoreBackwards();
    } else {
      const { scrollHeight, clientHeight } = containerRef.current!;
      if (clientHeight && scrollHeight <= clientHeight) {
        loadMoreBackwards();
      }
    }
  }, [items, loadMoreBackwards, preloadBackwards]);

  // Restore `scrollTop` after adding items
  useLayoutEffect(() => {
    const container = containerRef.current!;
    const { currentAnchor, currentAnchorTop } = stateRef.current;

    const listItemElements = container.querySelectorAll<HTMLDivElement>(itemSelector);
    stateRef.current.listItemElements = listItemElements;

    let newScrollTop;

    if (currentAnchor && Array.from(listItemElements).includes(currentAnchor)) {
      const { scrollTop } = container;
      const newAnchorTop = currentAnchor.getBoundingClientRect().top;
      newScrollTop = scrollTop + (newAnchorTop - currentAnchorTop);
    } else {
      newScrollTop = 0;

      const nextAnchor = listItemElements[0];
      if (nextAnchor) {
        stateRef.current.currentAnchor = nextAnchor;
        stateRef.current.currentAnchorTop = nextAnchor.getBoundingClientRect().top;
      }
    }

    setScrollTop(container, newScrollTop);

    stateRef.current.isScrollTopJustUpdated = true;
  }, [itemSelector, items]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (!loadMoreForwards || !loadMoreBackwards) {
      return;
    }

    const {
      listItemElements, isScrollTopJustUpdated, currentAnchor, currentAnchorTop,
    } = stateRef.current;

    if (isScrollTopJustUpdated) {
      stateRef.current.isScrollTopJustUpdated = false;
      return;
    }

    const container = containerRef.current!;
    const { scrollTop, scrollHeight, offsetHeight } = container;
    const isNearTop = scrollTop <= sensitiveArea;
    const isNearBottom = scrollHeight - (scrollTop + offsetHeight) <= sensitiveArea;
    let isUpdated = false;

    if (isNearTop) {
      const nextAnchor = listItemElements[0];
      if (nextAnchor) {
        const nextAnchorTop = nextAnchor.getBoundingClientRect().top;
        const newAnchorTop = currentAnchor && currentAnchor !== nextAnchor
          ? currentAnchor.getBoundingClientRect().top
          : nextAnchorTop;
        const isMovingUp = (
          currentAnchor && currentAnchorTop !== undefined && newAnchorTop > currentAnchorTop
        );

        if (isMovingUp) {
          stateRef.current.currentAnchor = nextAnchor;
          stateRef.current.currentAnchorTop = nextAnchorTop;
          isUpdated = true;
          loadMoreForwards();
        }
      }
    }

    if (isNearBottom) {
      const nextAnchor = listItemElements[listItemElements.length - 1];
      if (nextAnchor) {
        const nextAnchorTop = nextAnchor.getBoundingClientRect().top;
        const newAnchorTop = currentAnchor && currentAnchor !== nextAnchor
          ? currentAnchor.getBoundingClientRect().top
          : nextAnchorTop;
        const isMovingDown = (
          currentAnchor && currentAnchorTop !== undefined && newAnchorTop < currentAnchorTop
        );

        if (isMovingDown) {
          stateRef.current.currentAnchor = nextAnchor;
          stateRef.current.currentAnchorTop = nextAnchorTop;
          isUpdated = true;
          loadMoreBackwards();
        }
      }
    }

    if (!isUpdated) {
      if (currentAnchor) {
        stateRef.current.currentAnchorTop = currentAnchor.getBoundingClientRect().top;
      } else {
        const nextAnchor = listItemElements[0];

        if (nextAnchor) {
          stateRef.current.currentAnchor = nextAnchor;
          stateRef.current.currentAnchorTop = nextAnchor.getBoundingClientRect().top;
        }
      }
    }

    if (onScroll) {
      onScroll(e);
    }
  }, [loadMoreBackwards, loadMoreForwards, onScroll, sensitiveArea]);

  return (
    <div ref={containerRef} className={className} onScroll={handleScroll} teactFastList={!noFastList}>
      {children}
    </div>
  );
};

export default InfiniteScroll;
