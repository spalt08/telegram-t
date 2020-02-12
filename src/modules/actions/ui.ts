import { addReducer } from '../../lib/teact/teactn';

const MAX_STORED_EMOJIS = 18; // Represents two rows of recent emojis

addReducer('setIsUiReady', (global, actions, payload) => {
  const { isUiReady } = payload!;

  return {
    ...global,
    isUiReady,
  };
});

addReducer('toggleRightColumn', (global) => {
  return {
    ...global,
    showRightColumn: !global.showRightColumn,
  };
});

addReducer('addRecentEmoji', (global, action, payload) => {
  const { emoji } = payload!;
  const { recentEmojis } = global;
  if (!recentEmojis) {
    return {
      ...global,
      recentEmojis: [emoji],
    };
  }

  const newEmojis = recentEmojis.filter((e) => e !== emoji);
  newEmojis.unshift(emoji);
  if (newEmojis.length > MAX_STORED_EMOJIS) {
    newEmojis.pop();
  }

  return {
    ...global,
    recentEmojis: newEmojis,
  };
});
