import { addReducer, setGlobal } from '../lib/teactn';

import { GlobalState } from './types';

const INITIAL_STATE: GlobalState = {
  isInitialized: false,

  users: {
    byId: {},
  },

  chats: {
    ids: [],
    byId: {},
    scrollOffsetById: {},
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
