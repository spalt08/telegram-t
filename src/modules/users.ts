import { addReducer } from '../lib/teact/teactn';
import { GlobalState } from '../store/types';

addReducer('openUserInfo', (global, actions, payload) => {
  const { id } = payload!;

  return {
    ...global,
    showRightColumn: true,
    users: {
      ...global.users,
      selectedId: id,
    },
  };
});

const clearSelectedUserId = (global: GlobalState) => ({
  ...global,
  users: {
    ...global.users,
    selectedId: undefined,
  },
});

addReducer('openChatWithInfo', clearSelectedUserId);
addReducer('openChat', clearSelectedUserId);
