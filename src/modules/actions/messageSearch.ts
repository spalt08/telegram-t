import { addReducer } from '../../lib/teact/teactn';
import { updateSelectedChatId } from '../reducers';

addReducer('openMessageSearch', (global, actions, payload) => {
  const { id } = payload!;
  if (id === global.chats.selectedId && global.messageSearch.isTextSearch) {
    return global;
  }

  global = updateSelectedChatId(global, id);
  global = {
    ...global,
    showRightColumn: true,
    messageSearch: {
      isTextSearch: true,
    },
  };

  return global;
});

addReducer('closeMessageSearch', (global) => {
  return {
    ...global,
    showRightColumn: false,
    messageSearch: {
      isTextSearch: false,
    },
  };
});

addReducer('setMessageSearchQuery', (global, actions, payload) => {
  const { query } = payload!;
  const currentQuery = global.messageSearch.query;

  if (query === currentQuery) {
    return undefined;
  }

  return {
    ...global,
    messageSearch: {
      isTextSearch: true,
      query,
    },
  };
});

addReducer('setMessageSearchMediaType', (global, actions, payload) => {
  const { mediaType } = payload!;
  const currentMediaType = global.messageSearch.mediaType;

  if (mediaType === currentMediaType) {
    return undefined;
  }

  return {
    ...global,
    messageSearch: {
      isTextSearch: false,
      mediaType,
    },
  };
});
