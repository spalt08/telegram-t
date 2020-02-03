import { addReducer } from '../../lib/teact/teactn';

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
