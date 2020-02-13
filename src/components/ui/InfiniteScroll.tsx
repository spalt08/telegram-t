import { UIEvent } from 'react';
import React, {
  FC, useCallback, useEffect, useMemo, useRef,
} from '../../lib/teact/teact';

import { debounce } from '../../util/schedulers';

export type OnLoadMore = ({
  offsetId,
  direction,
}: {
  offsetId?: number;
  direction?: number;
}) => void;

interface IProps {
  className?: string;
  onLoadMore: OnLoadMore;
  items: any[];
  sensitiveHeight?: number;
  preloadBackwards?: number;
  reversed?: boolean;
  withForwards?: boolean;
  children: any;
}

const DEFAULT_SENSITIVE_HEIGHT = 1000;
const DEFAULT_PRELOAD_BACKWARDS = 50;
const FORWARDS = 1;
const BACKWARDS = -1;

const InfiniteScroll: FC = ({
  className,
  onLoadMore,
  items,
  sensitiveHeight = DEFAULT_SENSITIVE_HEIGHT,
  preloadBackwards = DEFAULT_PRELOAD_BACKWARDS,
  reversed,
  withForwards,
  children,
}: IProps) => {
  const containerRef = useRef<HTMLDivElement>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onLoadMoreDebounced = useMemo(() => debounce(onLoadMore, 1000, true, false), [onLoadMore, items]);

  const scrollTopRef = useRef<number>(0);
  const anchorOffsetRef = useRef<number>(undefined);

  useEffect(() => {
    if (items.length < preloadBackwards) {
      onLoadMoreDebounced({ direction: BACKWARDS });
    }
  }, [items.length, onLoadMoreDebounced, preloadBackwards]);

  const shouldHandleTop = reversed ? true : withForwards;
  const shouldHandleBottom = reversed ? withForwards : true;

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const container = e.target as HTMLElement;

    const { scrollTop, scrollHeight, offsetHeight } = container;

    const isNearTop = scrollTop <= sensitiveHeight;
    const isNearBottom = scrollHeight - (scrollTop + offsetHeight) <= sensitiveHeight;

    scrollTopRef.current = scrollTop;

    if (shouldHandleTop && isNearTop) {
      const anchor = container.firstElementChild as HTMLElement;
      if (anchor) {
        const newAnchorOffset = anchor.getBoundingClientRect().top;
        const isMovingUp = typeof anchorOffsetRef.current === 'number' && newAnchorOffset > anchorOffsetRef.current;
        anchorOffsetRef.current = newAnchorOffset;

        if (isMovingUp) {
          onLoadMoreDebounced({ direction: reversed ? BACKWARDS : FORWARDS });
        }
      }
    } else if (shouldHandleBottom && isNearBottom) {
      const anchor = container.lastElementChild as HTMLElement;
      if (anchor) {
        const newAnchorOffset = anchor.getBoundingClientRect().top;
        const isMovingDown = typeof anchorOffsetRef.current === 'number' && newAnchorOffset < anchorOffsetRef.current;
        anchorOffsetRef.current = newAnchorOffset;

        if (isMovingDown) {
          onLoadMoreDebounced({ direction: reversed ? FORWARDS : BACKWARDS });
        }
      }
    }
  }, [onLoadMoreDebounced, reversed, sensitiveHeight, shouldHandleBottom, shouldHandleTop]);

  return (
    <div ref={containerRef} className={className} onScroll={handleScroll}>
      {children}
    </div>
  );
};

export default InfiniteScroll;
