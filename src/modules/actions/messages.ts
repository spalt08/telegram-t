import { FocusDirection } from '../../types';

import { addReducer, getGlobal, setGlobal } from '../../lib/teact/teactn';
import {
  replaceViewportIds,
  updateFocusedMessageId,
  updateFocusDirection,
  updateSelectedChatId,
} from '../reducers';
import { selectLastReadOrVeryLastId, selectViewportIds } from '../selectors';

const FOCUS_DURATION = 2000;

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

addReducer('focusLastReadMessage', (global, actions) => {
  const { selectedId } = global.chats;

  if (!selectedId) {
    return;
  }

  actions.focusMessage({
    chatId: selectedId,
    messageId: selectLastReadOrVeryLastId(global, selectedId),
  });
});

addReducer('focusMessage', (global, actions, payload) => {
  const { chatId, messageId } = payload!;
  const shouldSwitchChat = chatId !== global.chats.selectedId;

  if (blurTimeout) {
    clearTimeout(blurTimeout);
  }
  blurTimeout = window.setTimeout(() => {
    let newGlobal = getGlobal();
    newGlobal = updateFocusedMessageId(newGlobal, chatId, undefined);
    newGlobal = updateFocusDirection(newGlobal, chatId, undefined);
    setGlobal(newGlobal);
  }, FOCUS_DURATION);

  let newGlobal = global;
  newGlobal = updateFocusedMessageId(newGlobal, chatId, messageId);

  if (shouldSwitchChat) {
    newGlobal = updateSelectedChatId(newGlobal, chatId);
  }

  const viewportIds = selectViewportIds(newGlobal, chatId);
  if (viewportIds && viewportIds.includes(messageId)) {
    return newGlobal;
  } else {
    if (shouldSwitchChat) {
      // We only clean viewport when switching chat.
      newGlobal = replaceViewportIds(newGlobal, chatId, []);
    } else if (viewportIds) {
      const direction = messageId < viewportIds[0] ? FocusDirection.Up : FocusDirection.Down;
      newGlobal = updateFocusDirection(newGlobal, chatId, direction);
    }

    setGlobal(newGlobal);

    actions.loadViewportMessages({ shouldRelocate: true });
    return undefined;
  }
});
