import { addReducer, setGlobal } from '../lib/teactn';

import { GlobalState } from './types';

const INITIAL_STATE: GlobalState = {
  isInitialized: false,
  showRightColumn: true,

  users: {
    byId: {},
  },

  chats: {
    ids: [],
    byId: {},
    scrollOffsetById: {},
  },

  groups: {
    ids: [],
    byId: {},
  },

  messages: {
    byChatId: {},
  },

  files: {
    byId: {},
  },

  authRememberMe: true,
};

addReducer('init', () => {
  setGlobal(INITIAL_STATE);
});

addReducer('toggleRightColumn', (global) => {
  return {
    ...global,
    showRightColumn: !global.showRightColumn,
  };
});
