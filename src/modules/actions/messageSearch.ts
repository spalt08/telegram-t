import { addReducer } from '../../lib/teact/teactn';
import { updateSelectedChatId } from '../reducers';

addReducer('openMessageSearch', (global, actions, payload) => {
  const { id } = payload!;
  if (id === global.chats.selectedId && global.messageSearch.isActive) {
    return global;
  }

  global = updateSelectedChatId(global, id);
  global = {
    ...global,
    showRightColumn: true,
    messageSearch: {
      isActive: true,
    },
  };

  return global;
});

addReducer('closeMessageSearch', (global) => {
  return {
    ...global,
    showRightColumn: false,
    messageSearch: {
      isActive: false,
    },
  };
});

addReducer('setMessageSearchQuery', (global, actions, payload) => {
  const { query } = payload!;

  return {
    ...global,
    messageSearch: {
      ...global.messageSearch,
      query,
    },
  };
});
