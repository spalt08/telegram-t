import { GlobalState } from '../../global/types';
import { ApiMessageSearchType } from '../../api/types';
import { areSortedArraysEqual, unique } from '../../util/iteratees';

function replaceMessageSearch(
  global: GlobalState,
  chatId: number,
  searchParams: any,
): GlobalState {
  return {
    ...global,
    messageSearch: {
      byChatId: {
        ...global.messageSearch.byChatId,
        [chatId]: searchParams,
      },
    },
  };
}

export function updateMessageSearchType(
  global: GlobalState,
  chatId: number,
  currentType: ApiMessageSearchType | undefined,
  query?: string,
): GlobalState {
  return replaceMessageSearch(global, chatId, {
    ...global.messageSearch.byChatId[chatId],
    currentType,
    query,
  });
}

export function replaceMessageSearchResults(
  global: GlobalState,
  chatId: number,
  type: ApiMessageSearchType,
  foundIds?: number[],
  totalCount?: number,
  nextOffsetId?: number,
): GlobalState {
  return replaceMessageSearch(global, chatId, {
    ...global.messageSearch.byChatId[chatId],
    resultsByType: {
      ...(global.messageSearch.byChatId[chatId] || {}).resultsByType,
      [type]: {
        foundIds,
        totalCount,
        nextOffsetId,
      },
    },
  });
}

export function updateMessageSearchResults(
  global: GlobalState,
  chatId: number,
  type: ApiMessageSearchType,
  newFoundIds: number[],
  totalCount?: number,
  nextOffsetId?: number,
): GlobalState {
  const { resultsByType } = global.messageSearch.byChatId[chatId] || {};
  const prevFoundIds = resultsByType && resultsByType[type] ? resultsByType[type].foundIds : [];
  const foundIds = unique(Array.prototype.concat(prevFoundIds, newFoundIds));
  const foundOrPrevFoundIds = areSortedArraysEqual(prevFoundIds, foundIds) ? prevFoundIds : foundIds;

  return replaceMessageSearchResults(global, chatId, type, foundOrPrevFoundIds, totalCount, nextOffsetId);
}
