import { addReducer } from '../lib/teactn';

addReducer('selectUserToView', (global, actions, payload) => {
  const { id, forceOpen } = payload!;

  return {
    ...global,
    ...(forceOpen && { showRightColumn: true }),
    users: {
      ...global.users,
      selectedId: id,
    },
  };
});

addReducer('selectChatToView', (global) => {
  return {
    ...global,
    users: {
      ...global.users,
      selectedId: undefined,
    },
  };
});
