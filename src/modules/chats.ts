import { addReducer } from '../lib/teact/teactn';
import { updateChatReplyingTo, updateChatScrollOffset } from './common/chats';

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

addReducer('setChatScrollOffset', (global, actions, payload) => {
  const { chatId, scrollOffset } = payload!;

  return updateChatScrollOffset(global, chatId, scrollOffset);
});

addReducer('setChatReplyingTo', (global, actions, payload) => {
  const { chatId, messageId } = payload!;

  return updateChatReplyingTo(global, chatId, messageId);
});
