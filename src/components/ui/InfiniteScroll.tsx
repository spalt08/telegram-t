import { UIEvent } from 'react';
import React, {
  FC, useCallback, useEffect, useMemo, useRef,
} from '../../lib/teact/teact';

import { debounce } from '../../util/schedulers';

interface IProps {
  className?: string;
  onLoadMore: AnyToVoidFunction;
  items: any[];
  sensitiveHeight?: number;
  preloadBackwards?: number;
  children: any;
}

const DEFAULT_SENSITIVE_HEIGHT = 1200;
const DEFAULT_PRELOAD_BACKWARDS = 50;
const BACKWARDS = -1;

const InfiniteScroll: FC = ({
  className,
  onLoadMore,
  items,
  sensitiveHeight = DEFAULT_SENSITIVE_HEIGHT,
  preloadBackwards = DEFAULT_PRELOAD_BACKWARDS,
  children,
}: IProps) => {
  const containerRef = useRef<HTMLDivElement>();
  const anchorTopRef = useRef<number>(undefined);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onLoadMoreDebounced = useMemo(() => debounce(onLoadMore, 1000, true, false), [onLoadMore, items]);

  useEffect(() => {
    if (items.length < preloadBackwards) {
      onLoadMoreDebounced({ direction: BACKWARDS });
    }
  }, [items.length, onLoadMoreDebounced, preloadBackwards]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const container = e.target as HTMLElement;
    const { scrollTop, scrollHeight, offsetHeight } = container;
    const isNearBottom = scrollHeight - (scrollTop + offsetHeight) <= sensitiveHeight;

    if (isNearBottom) {
      const anchor = container.lastElementChild as HTMLElement;
      if (anchor) {
        const newAnchorTop = anchor.getBoundingClientRect().top;
        const isMovingDown = typeof anchorTopRef.current === 'number' && newAnchorTop < anchorTopRef.current;
        anchorTopRef.current = newAnchorTop;

        if (isMovingDown) {
          onLoadMoreDebounced({ direction: BACKWARDS });
        }
      }
    }
  }, [onLoadMoreDebounced, sensitiveHeight]);

  return (
    <div ref={containerRef} className={className} onScroll={handleScroll}>
      {children}
    </div>
  );
};

export default InfiniteScroll;
