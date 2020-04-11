import { addReducer } from '../../../lib/teact/teactn';

import { updateGlobalSearch } from '../../reducers';

const MAX_RECENTLY_FOUND_IDS = 10;

addReducer('setGlobalSearchQuery', (global, actions, payload) => {
  const { query } = payload!;

  return updateGlobalSearch(global, {
    globalResults: {},
    localResults: {},
    ...(query ? { fetchingStatus: { chats: true, messages: true } } : { fetchingStatus: undefined }),
    query,
  });
});

addReducer('addRecentlyFoundChatId', (global, actions, payload) => {
  const { id } = payload!;
  const { recentlyFoundChatIds } = global.globalSearch;

  if (!recentlyFoundChatIds) {
    return updateGlobalSearch(global, { recentlyFoundChatIds: [id] });
  }

  const newRecentIds = recentlyFoundChatIds.filter((chatId) => chatId !== id);
  newRecentIds.unshift(id);
  if (newRecentIds.length > MAX_RECENTLY_FOUND_IDS) {
    newRecentIds.pop();
  }

  return updateGlobalSearch(global, { recentlyFoundChatIds: newRecentIds });
});
