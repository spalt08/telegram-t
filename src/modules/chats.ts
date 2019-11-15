import { addReducer } from '../lib/teactn';

addReducer('selectChat', (global, actions, payload) => {
  const { id } = payload!;

  localStorage.setItem('selectedChatId', id);

  return {
    ...global,
    chats: {
      ...global.chats,
      selectedId: id,
    },
  };
});
