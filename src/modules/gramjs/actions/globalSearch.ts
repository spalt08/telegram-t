import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { callApi } from '../../../api/gramjs';

import {
  updateChats,
  addUsers,
  updateGlobalSearchResults,
  updateGlobalSearch,
} from '../../reducers';
import { throttle } from '../../../util/schedulers';
import { selectCurrentGlobalSearchQuery } from '../../selectors';
import { buildCollectionByKey } from '../../../util/iteratees';
import { GLOBAL_SEARCH_SLICE } from '../../../config';

const searchThrottled = throttle((cb) => cb(), 500, false);

addReducer('setGlobalSearchQuery', (global, actions, payload) => {
  const { query } = payload!;

  if (query) {
    void searchThrottled(() => {
      searchChats(query);
    });
  }
});

addReducer('searchMessagesGlobal', (global) => {
  const { query, globalResults } = global.globalSearch;
  const { nextRate } = (globalResults && globalResults.messages) || {};

  if (query) {
    searchMessages(query, nextRate);
  }
});

async function searchChats(query: string) {
  const result = await callApi('searchChats', { query, limit: GLOBAL_SEARCH_SLICE });

  let newGlobal = getGlobal();
  const currentSearchQuery = selectCurrentGlobalSearchQuery(newGlobal);
  if (!result || !currentSearchQuery || (query !== currentSearchQuery)) {
    setGlobal(updateGlobalSearch(newGlobal, {
      fetchingStatus: {
        ...newGlobal.globalSearch.fetchingStatus,
        chats: false,
      },
    }));
    return;
  }

  const {
    localChats, localUsers, globalChats, globalUsers,
  } = result;

  if (localChats.length || globalChats.length) {
    newGlobal = updateChats(newGlobal, buildCollectionByKey([...localChats, ...globalChats], 'id'));
  }

  if (localUsers.length || globalUsers.length) {
    newGlobal = addUsers(newGlobal, buildCollectionByKey([...localUsers, ...globalUsers], 'id'));
  }

  newGlobal = updateGlobalSearch(newGlobal, {
    fetchingStatus: {
      ...newGlobal.globalSearch.fetchingStatus,
      chats: false,
    },
    localResults: {
      chats: localChats,
      users: localUsers,
    },
    globalResults: {
      ...newGlobal.globalSearch.globalResults,
      chats: globalChats,
      users: globalUsers,
    },
  });

  setGlobal(newGlobal);
}

async function searchMessages(query: string, offsetRate?: number) {
  const result = await callApi('searchMessagesGlobal', { query, offsetRate, limit: GLOBAL_SEARCH_SLICE });

  let newGlobal = getGlobal();
  const currentSearchQuery = selectCurrentGlobalSearchQuery(newGlobal);
  if (!result || !currentSearchQuery || (query !== currentSearchQuery)) {
    setGlobal(updateGlobalSearch(newGlobal, {
      fetchingStatus: {
        ...newGlobal.globalSearch.fetchingStatus,
        messages: false,
      },
    }));
    return;
  }

  const {
    messages, users, chats, totalCount, nextRate,
  } = result;

  if (chats.length) {
    newGlobal = updateChats(newGlobal, buildCollectionByKey(chats, 'id'));
  }

  if (users.length) {
    newGlobal = addUsers(newGlobal, buildCollectionByKey(users, 'id'));
  }

  newGlobal = updateGlobalSearchResults(
    newGlobal,
    buildCollectionByKey(messages, 'id'),
    totalCount,
    nextRate,
  );

  setGlobal(newGlobal);
}
