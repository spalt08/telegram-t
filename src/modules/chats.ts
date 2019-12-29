import { addReducer } from '../lib/teactn';

addReducer('openChat', (global, actions, payload) => {
  const { id } = payload!;

  return {
    ...global,
    chats: {
      ...global.chats,
      selectedId: id,
    },
  };
});

addReducer('openChatWithInfo', (global, actions, payload) => {
  const { id } = payload!;

  // Only used in TdLib now.
  localStorage.setItem('selectedChatId', id);

  return {
    ...global,
    showRightColumn: true,
    chats: {
      ...global.chats,
      selectedId: id,
    },
  };
});
