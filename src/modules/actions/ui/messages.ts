import { FocusDirection } from '../../../types';

import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';
import {
  replaceOutlyingIds, replaceViewportIds, updateFocusDirection, updateFocusedMessage, updateSelectedChatId,
} from '../../reducers';
import { selectOpenChat, selectViewportIds, selectIsRightColumnShown } from '../../selectors';

const FOCUS_DURATION = 2000;
const FORWARD_MENU_OPEN_DELAY_MS = 450;

let blurTimeout: number | undefined;

addReducer('openMediaViewer', (global, actions, payload) => {
  const {
    chatId, messageId, avatarOwnerId, origin,
  } = payload!;

  return {
    ...global,
    mediaViewer: {
      chatId,
      messageId,
      avatarOwnerId,
      origin,
    },
    forwardMessages: {},
  };
});

addReducer('openAudioPlayer', (global, actions, payload) => {
  const {
    chatId, messageId,
  } = payload!;

  return {
    ...global,
    audioPlayer: {
      chatId,
      messageId,
    },
  };
});

addReducer('closeAudioPlayer', (global) => {
  return {
    ...global,
    audioPlayer: {},
  };
});

addReducer('focusLastMessage', (global, actions) => {
  const selectedChat = selectOpenChat(global);
  if (!selectedChat) {
    return;
  }

  const chatId = selectedChat.id;
  const messageId = selectedChat.lastMessage && selectedChat.lastMessage.id;

  if (messageId) {
    actions.focusMessage({ chatId, messageId, noHighlight: true });
  }
});

addReducer('focusMessage', (global, actions, payload) => {
  const { chatId, messageId, noHighlight } = payload!;
  const shouldSwitchChat = chatId !== global.chats.selectedId;

  if (blurTimeout) {
    clearTimeout(blurTimeout);
    blurTimeout = undefined;
  }
  blurTimeout = window.setTimeout(() => {
    let newGlobal = getGlobal();
    newGlobal = updateFocusedMessage(newGlobal);
    newGlobal = updateFocusDirection(newGlobal);
    setGlobal(newGlobal);
  }, FOCUS_DURATION);

  let newGlobal = global;

  newGlobal = updateFocusedMessage(newGlobal, chatId, messageId, noHighlight);

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
    const direction = messageId > viewportIds[0] ? FocusDirection.Down : FocusDirection.Up;
    newGlobal = updateFocusDirection(newGlobal, direction);
  }

  setGlobal(newGlobal);

  actions.loadViewportMessages({ shouldRelocate: true });
  return undefined;
});

addReducer('openForwardMenu', (global, actions, payload) => {
  const { fromChatId, messageIds, noDelay } = payload!;

  const shouldOpenInstantly = selectIsRightColumnShown(global) || noDelay;

  setGlobal({
    ...global,
    forwardMessages: {
      fromChatId,
      messageIds,
      ...(shouldOpenInstantly && { isColumnShown: true }),
    },
  });

  if (!shouldOpenInstantly) {
    window.setTimeout(() => {
      const newGlobal = getGlobal();

      setGlobal({
        ...newGlobal,
        forwardMessages: {
          ...newGlobal.forwardMessages,
          isColumnShown: true,
        },
      });
    }, FORWARD_MENU_OPEN_DELAY_MS);
  }
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
