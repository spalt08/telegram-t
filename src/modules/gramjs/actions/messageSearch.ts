import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat, ApiMessageSearchMediaType, ApiUser } from '../../../api/types';

import { callApi } from '../../../api/gramjs';
import { selectOpenChat, selectOpenUser } from '../../selectors';
import { areSortedArraysEqual, buildCollectionByKey, unique } from '../../../util/iteratees';
import { addChatMessagesById, updateUsers } from '../../reducers';
import { debounce } from '../../../util/schedulers';

const SEARCH_LIMIT = 50;

const runDebouncedForSearch = debounce((cb) => cb(), 200, false);

addReducer('searchMessages', (global) => {
  const chatOrUser = selectOpenUser(global) || selectOpenChat(global);
  const { query, mediaType, nextOffsetId: offsetId } = global.messageSearch;

  if (!chatOrUser || !(query || mediaType)) {
    return;
  }

  runDebouncedForSearch(() => searchMessages(chatOrUser, query, mediaType, offsetId));
});

async function searchMessages(
  chatOrUser: ApiChat | ApiUser,
  query?: string,
  mediaType?: ApiMessageSearchMediaType,
  offsetId?: number,
) {
  const result = await callApi('searchMessages', {
    chatOrUser, query, mediaType, limit: SEARCH_LIMIT, offsetId,
  });

  if (!result) {
    return;
  }

  const {
    messages, users, totalCount, nextOffsetId,
  } = result;

  const byId = buildCollectionByKey(messages, 'id');

  let newGlobal = getGlobal();
  newGlobal = addChatMessagesById(newGlobal, chatOrUser.id, byId);
  newGlobal = updateUsers(newGlobal, buildCollectionByKey(users, 'id'));

  const currentFoundIds = newGlobal.messageSearch.foundIds || [];
  const newFoundIds = Object.keys(byId).map(Number);
  const foundIds = unique(Array.prototype.concat(currentFoundIds, newFoundIds));
  newGlobal = {
    ...newGlobal,
    messageSearch: {
      ...newGlobal.messageSearch,
      totalCount,
      ...(nextOffsetId && { nextOffsetId }),
      ...(!areSortedArraysEqual(currentFoundIds, foundIds) && { foundIds }),
    },
  };

  setGlobal(newGlobal);
}
