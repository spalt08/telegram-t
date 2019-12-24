import { addReducer } from '../lib/teactn';

addReducer('selectMediaMessage', (global, actions, payload) => {
  const { id } = payload!;

  return {
    ...global,
    messages: {
      ...global.messages,
      selectedMediaMessageId: id,
    },
  };
});
