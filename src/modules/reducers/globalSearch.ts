import { GlobalState } from '../../global/types';
import { ApiMessage } from '../../api/types';

export function updateGlobalSearch(
  global: GlobalState,
  searchStatePartial: Partial<GlobalState['globalSearch']>,
) {
  return {
    ...global,
    globalSearch: {
      ...global.globalSearch,
      ...searchStatePartial,
    },
  };
}

export function updateGlobalSearchResults(
  global: GlobalState,
  newFoundMessagesById: Record<number, ApiMessage>,
  totalCount: number,
  nextRate?: number,
): GlobalState {
  const { messages } = global.globalSearch.globalResults || {};
  const byId = messages && messages.byId;

  if (byId && Object.keys(newFoundMessagesById).every((newId) => Boolean(byId[Number(newId)]))) {
    return updateGlobalSearch(global, {
      fetchingStatus: {
        ...global.globalSearch.fetchingStatus,
        messages: false,
      },
    });
  }

  return updateGlobalSearch(global, {
    fetchingStatus: {
      ...global.globalSearch.fetchingStatus,
      messages: false,
    },
    globalResults: {
      ...global.globalSearch.globalResults,
      messages: {
        totalCount,
        nextRate,
        byId: {
          ...byId,
          ...newFoundMessagesById,
        },
      },
    },
  });
}
