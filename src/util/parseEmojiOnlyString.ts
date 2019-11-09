// @ts-ignore
import emojiRegex from 'emoji-regex';

const RE_EMOJI = emojiRegex();
const RE_EMOJI_ONLY = new RegExp(`^(?:${emojiRegex().source})+$`, '');

export default (text: string): number | false => {
  const isEmojiOnly = RE_EMOJI_ONLY.exec(text);

  if (!isEmojiOnly) {
    return false;
  }

  let emojiCount = 0;
  while (RE_EMOJI.exec(text)) {
    emojiCount++;
  }

  return emojiCount;
};
