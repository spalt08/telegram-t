import { addReducer } from '../lib/teactn';

addReducer('selectChatToView', (global, actions, payload) => {
  const { id, forceOpen } = payload!;

  // Only used in TdLib now.
  localStorage.setItem('selectedChatId', id);

  return {
    ...global,
    ...(forceOpen && { showRightColumn: true }),
    chats: {
      ...global.chats,
      selectedId: id,
    },
  };
});
