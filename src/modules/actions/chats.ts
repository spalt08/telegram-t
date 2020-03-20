import { addReducer } from '../../lib/teact/teactn';
import {
  updateChatReplyingTo,
  updateChatScrollOffset,
  updateSelectedChatId,
  updateChatEditing,
} from '../reducers';
import { selectChatMessages, selectIsOwnMessage, selectAllowedMessagedActions } from '../selectors';

addReducer('openChat', (global, actions, payload) => {
  const { id } = payload!;

  return updateSelectedChatId(global, id);
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

addReducer('setChatEditing', (global, actions, payload) => {
  const { chatId, messageId } = payload!;

  return updateChatEditing(global, chatId, messageId);
});

addReducer('editLastChatMessage', (global) => {
  const { selectedId } = global.chats;

  if (!selectedId) {
    return global;
  }

  const chatMessages = selectChatMessages(global, selectedId);
  if (!chatMessages) {
    return global;
  }

  const lastUserMessage = Object.values(chatMessages)
    .filter((message) => selectIsOwnMessage(global, message))
    .pop();

  if (lastUserMessage) {
    const { canEdit } = selectAllowedMessagedActions(global, lastUserMessage);
    if (canEdit) {
      return updateChatEditing(global, selectedId, lastUserMessage.id);
    }
  }

  return global;
});
