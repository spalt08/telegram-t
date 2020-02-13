import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat, ApiMessageSearchMediaType } from '../../../api/types';

import { callApi } from '../../../api/gramjs';
import { selectOpenChat } from '../../selectors';
import { areSortedArraysEqual, buildCollectionByKey, unique } from '../../../util/iteratees';
import { addChatMessagesById, updateUsers } from '../../reducers';
import { debounce } from '../../../util/schedulers';

const SEARCH_LIMIT = 50;

const runDebouncedForSearch = debounce((cb) => cb(), 200, false);

addReducer('searchMessages', (global) => {
  const chat = selectOpenChat(global);
  const { query, mediaType, nextOffsetId: offsetId } = global.messageSearch;

  if (!chat || !(query || mediaType)) {
    return;
  }

  runDebouncedForSearch(() => searchMessages(chat, query, mediaType, offsetId));
});

async function searchMessages(chat: ApiChat, query?: string, mediaType?: ApiMessageSearchMediaType, offsetId?: number) {
  const result = await callApi('searchMessages', {
    chat, query, mediaType, limit: SEARCH_LIMIT, offsetId,
  });

  if (!result) {
    return;
  }

  const {
    messages, users, totalCount, nextOffsetId,
  } = result;

  const byId = buildCollectionByKey(messages, 'id');

  let newGlobal = getGlobal();
  newGlobal = addChatMessagesById(newGlobal, chat.id, byId);
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
