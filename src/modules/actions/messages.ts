import { FocusDirection } from '../../types';

import { addReducer, getGlobal, setGlobal } from '../../lib/teact/teactn';
import {
  replaceOutlyingIds, replaceViewportIds, updateFocusDirection, updateFocusedMessage, updateSelectedChatId,
} from '../reducers';
import {
  selectFirstUnreadId, selectOpenChat, selectRealLastReadId, selectViewportIds,
} from '../selectors';

const FOCUS_DURATION = 2000;

let blurTimeout: number;

addReducer('openMediaViewer', (global, actions, payload) => {
  const {
    chatId, messageId, avatarOwnerId, isReversed = false,
  } = payload!;

  return {
    ...global,
    mediaViewer: {
      chatId,
      messageId,
      avatarOwnerId,
      isReversed,
    },
    forwardMessages: {},
  };
});

addReducer('focusTopMessage', (global, actions) => {
  const selectedChat = selectOpenChat(global);
  if (!selectedChat) {
    return;
  }

  const chatId = selectedChat.id;
  const messageId = selectedChat.unread_count
    ? selectFirstUnreadId(global, chatId) || selectRealLastReadId(global, chatId)
    : selectedChat.last_message && selectedChat.last_message.id;

  if (messageId) {
    actions.focusMessage({ chatId, messageId });
  }
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

  if (shouldSwitchChat) {
    newGlobal = updateSelectedChatId(newGlobal, chatId);
    newGlobal = replaceViewportIds(newGlobal, chatId, undefined);
    newGlobal = updateFocusDirection(newGlobal, FocusDirection.Static);
  }

  const viewportIds = selectViewportIds(newGlobal, chatId);
  if (viewportIds && viewportIds.includes(messageId)) {
    return newGlobal;
  }

  newGlobal = replaceOutlyingIds(newGlobal, chatId, undefined);

  if (viewportIds && !shouldSwitchChat) {
    const direction = messageId < viewportIds[0] ? FocusDirection.Up : FocusDirection.Down;
    newGlobal = updateFocusDirection(newGlobal, direction);
  }

  setGlobal(newGlobal);

  actions.loadViewportMessages({ shouldRelocate: true });
  return undefined;
});

addReducer('openForwardMenu', (global, actions, payload) => {
  const { fromChatId, messageIds } = payload!;

  setGlobal({
    ...global,
    forwardMessages: {
      fromChatId,
      messageIds,
    },
  });
});

addReducer('closeForwardMenu', (global) => {
  setGlobal({
    ...global,
    forwardMessages: {},
  });
});

addReducer('setForwardChatIds', (global, actions, payload) => {
  const { ids } = payload!;

  setGlobal({
    ...global,
    forwardMessages: {
      ...global.forwardMessages,
      toChatIds: ids,
    },
  });
});
