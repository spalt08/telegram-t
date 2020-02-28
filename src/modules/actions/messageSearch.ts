import { addReducer } from '../../lib/teact/teactn';
import { selectCurrentMessageSearch, selectCurrentMessageSearchChatId } from '../selectors';
import { replaceMessageSearchResults, updateMessageSearchType } from '../reducers';
import { MEMO_EMPTY_ARRAY } from '../../util/memo';

addReducer('openMessageSearch', (global) => {
  const chatId = selectCurrentMessageSearchChatId(global);

  if (!chatId) {
    return undefined;
  }

  return updateMessageSearchType(global, chatId, 'text');
});

addReducer('closeMessageSearch', (global) => {
  const chatId = selectCurrentMessageSearchChatId(global);

  if (!chatId) {
    return undefined;
  }

  return updateMessageSearchType(global, chatId, undefined);
});

addReducer('setMessageSearchQuery', (global, actions, payload) => {
  const chatId = selectCurrentMessageSearchChatId(global);

  if (!chatId) {
    return undefined;
  }

  const { query } = payload!;
  const { query: currentQuery } = selectCurrentMessageSearch(global) || {};

  if (query !== currentQuery) {
    global = replaceMessageSearchResults(global, chatId, 'text', MEMO_EMPTY_ARRAY);
  }

  global = updateMessageSearchType(global, chatId, 'text', query);

  return global;
});

addReducer('setMessageSearchMediaType', (global, actions, payload) => {
  const chatId = selectCurrentMessageSearchChatId(global);

  if (!chatId) {
    return undefined;
  }

  const { mediaType } = payload!;
  return updateMessageSearchType(global, chatId, mediaType);
});
