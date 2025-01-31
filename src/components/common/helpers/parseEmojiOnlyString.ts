// @ts-ignore
import emojiRegex from 'emoji-regex';

const DETECT_UP_TO = 3;
const MAX_LENGTH = DETECT_UP_TO * 8; // Maximum 8 per one emoji.
const RE_EMOJI_ONLY = new RegExp(`^(?:${emojiRegex().source})+$`, '');

export default (text: string): number | false => {
  if (text.length > MAX_LENGTH) {
    return false;
  }

  const isEmojiOnly = Boolean(text.match(RE_EMOJI_ONLY));

  if (!isEmojiOnly) {
    return false;
  }

  let emojiCount = 0;
  const regex = emojiRegex();
  while (regex.exec(text)) {
    emojiCount++;

    if (emojiCount > DETECT_UP_TO) {
      return false;
    }
  }

  return emojiCount;
};
