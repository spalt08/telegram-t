import { addReducer, getGlobal, setGlobal } from '../../lib/teact/teactn';
import { updateFocusedMessageId, updateSelectedChatId } from '../reducers';

const BLUR_DELAY = 2000;

let blurTimeout: number;

addReducer('openMediaViewer', (global, actions, payload) => {
  const { chatId, messageId, isReversed = false } = payload!;

  return {
    ...global,
    mediaViewer: {
      chatId,
      messageId,
      isReversed,
    },
  };
});

addReducer('focusMessage', (global, actions, payload) => {
  const { chatId, messageId } = payload!;

  global = updateSelectedChatId(global, chatId);
  global = updateFocusedMessageId(global, chatId, messageId);

  if (blurTimeout) {
    clearTimeout(blurTimeout);
  }
  blurTimeout = window.setTimeout(() => {
    setGlobal(updateFocusedMessageId(getGlobal(), chatId, undefined));
  }, BLUR_DELAY);

  return global;
});
