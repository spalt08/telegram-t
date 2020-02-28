import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat, ApiMessageSearchType, ApiUser } from '../../../api/types';

import { callApi } from '../../../api/gramjs';
import {
  selectCurrentMessageSearch,
  selectCurrentMessageSearchChatId,
} from '../../selectors';
import { buildCollectionByKey } from '../../../util/iteratees';
import { addChatMessagesById, addUsers, updateMessageSearchResults } from '../../reducers';

const SEARCH_LIMIT = 50;

addReducer('searchMessages', (global) => {
  const currentSearchChatId = selectCurrentMessageSearchChatId(global);
  const chatOrUser = currentSearchChatId
    ? global.users.byId[currentSearchChatId] || global.chats.byId[currentSearchChatId]
    : undefined;
  const currentSearch = selectCurrentMessageSearch(global);

  if (!chatOrUser || !currentSearch) {
    return;
  }

  const { currentType: type, query, resultsByType } = currentSearch;
  const currentResults = type && resultsByType && resultsByType[type];
  const offsetId = currentResults ? currentResults.nextOffsetId : undefined;

  if (!type) {
    return;
  }

  void searchMessages(chatOrUser, type, query, offsetId);
});

async function searchMessages(
  chatOrUser: ApiChat | ApiUser,
  type: ApiMessageSearchType,
  query?: string,
  offsetId?: number,
) {
  const result = await callApi('searchMessages', {
    chatOrUser, type, query, limit: SEARCH_LIMIT, offsetId,
  });

  if (!result) {
    return;
  }

  const {
    messages, users, totalCount, nextOffsetId,
  } = result;

  const byId = buildCollectionByKey(messages, 'id');
  const newFoundIds = Object.keys(byId).map(Number);

  let newGlobal = getGlobal();

  const currentSearch = selectCurrentMessageSearch(newGlobal);
  if (!currentSearch || (query && query !== currentSearch.query)) {
    return;
  }

  newGlobal = addChatMessagesById(newGlobal, chatOrUser.id, byId);
  newGlobal = addUsers(newGlobal, buildCollectionByKey(users, 'id'));
  newGlobal = updateMessageSearchResults(newGlobal, chatOrUser.id, type, newFoundIds, totalCount, nextOffsetId);
  setGlobal(newGlobal);
}
