import { addReducer } from '../../../lib/teact/teactn';

import getReadableErrorText from '../../../util/getReadableErrorText';

const MAX_STORED_EMOJIS = 18; // Represents two rows of recent emojis

addReducer('toggleChatInfo', (global) => {
  return {
    ...global,
    isChatInfoShown: !global.isChatInfoShown,
  };
});

addReducer('toggleStatistics', (global) => {
  return {
    ...global,
    isStatisticsShown: !global.isStatisticsShown,
  };
});

addReducer('openChat', (global, actions, payload) => {
  const { id } = payload!;

  return {
    ...global,
    isLeftColumnShown: id === undefined,
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
  const { recent } = global.stickers;
  if (!recent) {
    return {
      ...global,
      stickers: {
        ...global.stickers,
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
      ...global.stickers,
      recent: {
        ...recent,
        stickers: newStickers,
      },
    },
  };
});

addReducer('showError', (global, actions, payload) => {
  const { error } = payload!;

  // Filter out errors that we don't want to show to the user
  if (!getReadableErrorText(error)) {
    return global;
  }

  const newErrors = [...global.errors];
  const existingErrorIndex = newErrors.findIndex((err) => err.message === error.message);
  if (existingErrorIndex !== -1) {
    newErrors.splice(existingErrorIndex, 1);
  }

  newErrors.push(error);
  return {
    ...global,
    errors: newErrors,
  };
});

addReducer('dismissError', (global) => {
  const newErrors = [...global.errors];

  newErrors.pop();
  return {
    ...global,
    errors: newErrors,
  };
});
