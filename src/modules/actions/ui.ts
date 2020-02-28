import { addReducer } from '../../lib/teact/teactn';

const MAX_STORED_EMOJIS = 18; // Represents two rows of recent emojis

addReducer('setIsUiReady', (global, actions, payload) => {
  const { isUiReady } = payload!;

  return {
    ...global,
    isUiReady,
  };
});

// TODO Remove.
addReducer('toggleChatInfo', (global) => {
  return {
    ...global,
    showChatInfo: !global.showChatInfo,
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

addReducer('addRecentSticker', (global, action, payload) => {
  const { sticker } = payload!;
  const { all, recent } = global.stickers;
  if (!recent) {
    return {
      ...global,
      stickers: {
        all,
        recent: {
          hash: 0,
          stickers: [sticker],
        },
      },
    };
  }

  const newStickers = recent.stickers.filter((s) => s.id !== sticker.id);
  newStickers.unshift(sticker);

  return {
    ...global,
    stickers: {
      all,
      recent: {
        ...recent,
        stickers: newStickers,
      },
    },
  };
});
