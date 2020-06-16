import { useCallback, useRef } from '../lib/teact/teact';
import { LoadMoreDirection } from '../types';

import { areSortedArraysEqual } from '../util/iteratees';
import useForceUpdate from './useForceUpdate';
import usePrevious from './usePrevious';

type GetMore = (args: { direction: LoadMoreDirection }) => void;
type LoadMoreBackwards = (args: { offsetId?: number }) => void;

const LIST_SLICE = 30;

export default (
  loadMoreBackwards?: LoadMoreBackwards, listIds?: number[], isDisabled = false,
): [number[]?, GetMore?] => {
  const lastParamsRef = useRef<{
    direction?: LoadMoreDirection;
    offsetId?: number;
  }>();

  const viewportIdsRef = useRef<number[] | undefined>((() => {
    if (listIds && !lastParamsRef.current) {
      const { newViewportIds } = getViewportSlice(listIds, listIds[0], LoadMoreDirection.Forwards);
      return newViewportIds;
    }

    // Ignored
    return undefined;
  })());

  const forceUpdate = useForceUpdate();

  const prevListIds = usePrevious(listIds);
  if (listIds && !isDisabled && listIds !== prevListIds) {
    const { offsetId = listIds[0], direction = LoadMoreDirection.Forwards } = lastParamsRef.current || {};
    const { newViewportIds } = getViewportSlice(listIds, offsetId, direction);

    if (!viewportIdsRef.current || !areSortedArraysEqual(viewportIdsRef.current, newViewportIds)) {
      viewportIdsRef.current = newViewportIds;
    }
  }

  const getMore: GetMore = useCallback(({ direction }: { direction: LoadMoreDirection }) => {
    if (isDisabled) {
      return;
    }

    const viewportIds = viewportIdsRef.current;

    const offsetId = viewportIds
      ? direction === LoadMoreDirection.Backwards ? viewportIds[viewportIds.length - 1] : viewportIds[0]
      : undefined;

    if (!listIds) {
      if (loadMoreBackwards) {
        loadMoreBackwards({ offsetId });
      }

      return;
    }

    lastParamsRef.current = { ...lastParamsRef.current, direction, offsetId };

    const {
      newViewportIds, areSomeLocal, areAllLocal,
    } = getViewportSlice(listIds, offsetId, direction);

    if (areSomeLocal && !(viewportIds && areSortedArraysEqual(viewportIds, newViewportIds))) {
      viewportIdsRef.current = newViewportIds;
      forceUpdate();
    }

    if (!areAllLocal && loadMoreBackwards) {
      loadMoreBackwards({ offsetId });
    }
  }, [isDisabled, listIds, loadMoreBackwards, forceUpdate]);

  return isDisabled ? [listIds] : [viewportIdsRef.current, getMore];
};

function getViewportSlice(
  sourceIds: number[],
  offsetId = 0,
  direction: LoadMoreDirection,
) {
  const { length } = sourceIds;
  const index = sourceIds.indexOf(offsetId);
  const isForwards = direction === LoadMoreDirection.Forwards;
  const indexForDirection = isForwards ? index : (index + 1) || length;
  const from = Math.max(0, indexForDirection - LIST_SLICE);
  const to = indexForDirection + LIST_SLICE - 1;
  const newViewportIds = sourceIds.slice(Math.max(0, from), to + 1);

  let areSomeLocal;
  let areAllLocal;
  switch (direction) {
    case LoadMoreDirection.Forwards:
      areSomeLocal = indexForDirection > 0;
      areAllLocal = from >= 0;
      break;
    case LoadMoreDirection.Backwards:
      areSomeLocal = indexForDirection < length;
      areAllLocal = to <= length - 1;
      break;
  }

  return { newViewportIds, areSomeLocal, areAllLocal };
}
