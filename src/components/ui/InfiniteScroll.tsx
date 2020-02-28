import { RefObject, UIEvent } from 'react';
import React, {
  FC, useCallback, useEffect, useMemo, useRef,
} from '../../lib/teact/teact';

import { debounce } from '../../util/schedulers';

interface IProps {
  ref?: RefObject<HTMLDivElement>;
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
  ref,
  className,
  onLoadMore,
  items,
  sensitiveHeight = DEFAULT_SENSITIVE_HEIGHT,
  preloadBackwards = DEFAULT_PRELOAD_BACKWARDS,
  children,
}: IProps) => {
  let containerRef = useRef<HTMLDivElement>();
  if (ref) {
    containerRef = ref;
  }

  const anchorTopRef = useRef<number>(undefined);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onLoadMoreDebounced = useMemo(() => debounce(onLoadMore, 1000, true, false), [onLoadMore, items]);

  useEffect(() => {
    if (items && items.length < preloadBackwards) {
      onLoadMoreDebounced({ direction: BACKWARDS });
    }
  }, [items, onLoadMoreDebounced, preloadBackwards]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const container = e.target as HTMLElement;
    const anchor = container.firstChild as HTMLElement;
    if (!anchor) {
      return;
    }

    const { scrollTop, scrollHeight, offsetHeight } = container;
    const newAnchorTop = anchor.getBoundingClientRect().top;
    const isNearBottom = scrollHeight - (scrollTop + offsetHeight) <= sensitiveHeight;
    const isMovingDown = typeof anchorTopRef.current === 'number' && newAnchorTop < anchorTopRef.current;

    if (isNearBottom && isMovingDown) {
      onLoadMoreDebounced({ direction: BACKWARDS });
    }

    anchorTopRef.current = newAnchorTop;
  }, [onLoadMoreDebounced, sensitiveHeight]);

  return (
    <div ref={containerRef} className={className} onScroll={handleScroll}>
      {children}
    </div>
  );
};

export default InfiniteScroll;
