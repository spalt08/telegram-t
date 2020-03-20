import { RefObject, UIEvent } from 'react';
import { LoadMoreDirection } from '../../types';

import React, {
  FC, useCallback, useEffect, useMemo, useRef,
} from '../../lib/teact/teact';

import { debounce } from '../../util/schedulers';

interface IProps {
  ref?: RefObject<HTMLDivElement>;
  className?: string;
  onLoadMore: AnyToVoidFunction;
  items: any[];
  sensitiveArea?: number;
  preloadBackwards?: number;
  children: any;
}

const DEFAULT_SENSITIVE_AREA = 1200;
const DEFAULT_PRELOAD_BACKWARDS = 20;

const InfiniteScroll: FC<IProps> = ({
  ref,
  className,
  onLoadMore,
  items,
  sensitiveArea = DEFAULT_SENSITIVE_AREA,
  preloadBackwards = DEFAULT_PRELOAD_BACKWARDS,
  children,
}: IProps) => {
  let containerRef = useRef<HTMLDivElement>();
  if (ref) {
    containerRef = ref;
  }

  const anchorTopRef = useRef<number>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onLoadMoreDebounced = useMemo(() => debounce(onLoadMore, 1000, true, false), [onLoadMore, items]);

  useEffect(() => {
    if (items.length < preloadBackwards) {
      onLoadMoreDebounced({ direction: LoadMoreDirection.Backwards });
    }
  }, [items, onLoadMoreDebounced, preloadBackwards]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const container = e.target as HTMLElement;
    const anchor = container.firstElementChild;
    if (!anchor) {
      return;
    }

    const { scrollTop, scrollHeight, offsetHeight } = container;
    const newAnchorTop = anchor.getBoundingClientRect().top;
    const isNearBottom = scrollHeight - (scrollTop + offsetHeight) <= sensitiveArea;
    const isMovingDown = typeof anchorTopRef.current === 'number' && newAnchorTop < anchorTopRef.current;

    if (isNearBottom && isMovingDown) {
      onLoadMoreDebounced({ direction: LoadMoreDirection.Backwards });
    }

    anchorTopRef.current = newAnchorTop;
  }, [onLoadMoreDebounced, sensitiveArea]);

  return (
    <div ref={containerRef} className={className} onScroll={handleScroll}>
      {children}
    </div>
  );
};

export default InfiniteScroll;
