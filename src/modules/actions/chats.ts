import { addReducer } from '../../lib/teact/teactn';
import {
  updateChatReplyingTo, updateChatScrollOffset, updateSelectedChatId,
} from '../reducers';

addReducer('openChat', (global, actions, payload) => {
  const { id } = payload!;
  const { selectedId } = global.chats;

  if (selectedId !== id) {
    return updateSelectedChatId(global, id);
  } else {
    actions.focusLastReadMessage();
    return undefined;
  }
});

addReducer('openChatWithInfo', (global, actions, payload) => {
  const { id } = payload!;

  global = updateSelectedChatId(global, id);
  global = {
    ...global,
    showChatInfo: true,
  };

  return global;
});

addReducer('setChatScrollOffset', (global, actions, payload) => {
  const { chatId, scrollOffset } = payload!;

  return updateChatScrollOffset(global, chatId, scrollOffset);
});

addReducer('setChatReplyingTo', (global, actions, payload) => {
  const { chatId, messageId } = payload!;

  return updateChatReplyingTo(global, chatId, messageId);
});
