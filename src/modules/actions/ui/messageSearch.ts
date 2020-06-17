import { addReducer } from '../../../lib/teact/teactn';

import { replaceMessageSearchResults, updateMessageSearchType } from '../../reducers';
import { MEMO_EMPTY_ARRAY } from '../../../util/memo';

addReducer('openMessageTextSearch', (global) => {
  const chatId = global.chats.selectedId;

  if (!chatId) {
    return undefined;
  }

  return updateMessageSearchType(global, chatId, 'text');
});

addReducer('closeMessageTextSearch', (global) => {
  const chatId = global.chats.selectedId;

  if (!chatId) {
    return undefined;
  }

  let newGlobal = updateMessageSearchType(global, chatId, undefined);
  newGlobal = replaceMessageSearchResults(newGlobal, chatId, 'text', undefined);
  return newGlobal;
});

addReducer('setMessageSearchQuery', (global, actions, payload) => {
  const chatId = global.chats.selectedId;

  if (!chatId) {
    return undefined;
  }

  const { query } = payload!;
  const { query: currentQuery } = global.messageSearch.byChatId[chatId] || {};

  if (query !== currentQuery) {
    global = replaceMessageSearchResults(global, chatId, 'text', MEMO_EMPTY_ARRAY);
  }

  global = updateMessageSearchType(global, chatId, 'text', query);

  return global;
});

addReducer('setMessageSearchMediaType', (global, actions, payload) => {
  const chatId = global.users.selectedId || global.chats.selectedId;

  if (!chatId) {
    return undefined;
  }

  const { mediaType } = payload!;
  return updateMessageSearchType(global, chatId, mediaType);
});
