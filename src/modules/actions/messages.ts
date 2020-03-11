import { FocusDirection } from '../../types';

import { addReducer, getGlobal, setGlobal } from '../../lib/teact/teactn';
import {
  replaceOutlyingIds, replaceViewportIds, updateFocusDirection, updateFocusedMessage, updateSelectedChatId,
} from '../reducers';
import { selectRealLastReadId, selectViewportIds } from '../selectors';

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
    messageId: selectRealLastReadId(global, selectedId),
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
    newGlobal = updateFocusedMessage(newGlobal);
    newGlobal = updateFocusDirection(newGlobal);
    setGlobal(newGlobal);
  }, FOCUS_DURATION);

  let newGlobal = global;

  newGlobal = updateFocusedMessage(newGlobal, chatId, messageId);
  newGlobal = replaceOutlyingIds(newGlobal, chatId, undefined);

  if (shouldSwitchChat) {
    newGlobal = updateSelectedChatId(newGlobal, chatId);
    newGlobal = replaceViewportIds(newGlobal, chatId, undefined);
    newGlobal = updateFocusDirection(newGlobal, FocusDirection.Static);
  }

  const viewportIds = selectViewportIds(newGlobal, chatId);
  if (viewportIds && viewportIds.includes(messageId)) {
    return newGlobal;
  }

  if (viewportIds && !shouldSwitchChat) {
    const direction = messageId < viewportIds[0] ? FocusDirection.Up : FocusDirection.Down;
    newGlobal = updateFocusDirection(newGlobal, direction);
  }

  setGlobal(newGlobal);

  actions.loadViewportMessages({ shouldRelocate: true });
  return undefined;
});
