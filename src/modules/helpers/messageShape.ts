import { ApiMessage } from '../../api/types';

import parseEmojiOnlyString from '../../components/common/helpers/parseEmojiOnlyString';

// This module is separated from the `src` bundle as it uses a heavy `emoji-regex` dependency.
// May be merged back after upgrade to Parcel v2.
export function getMessageCustomShape(message: ApiMessage): boolean | number {
  const {
    text, sticker, photo, video, audio, voice, document, poll, webPage, contact,
  } = message.content;

  if (sticker || (video && video.isRound)) {
    return true;
  }

  if (!text || photo || video || audio || voice || document || poll || webPage || contact) {
    return false;
  }

  // This is a "dual-intent" method used to limit calls of `parseEmojiOnlyString`.
  return parseEmojiOnlyString(text.text) || false;
}
