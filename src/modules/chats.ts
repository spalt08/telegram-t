import { addReducer } from '../lib/teactn';

addReducer('selectChat', (global, actions, payload) => {
  const { id } = payload!;

  return {
    ...global,
    chats: {
      ...global.chats,
      selectedId: id,
    }
  };
});
