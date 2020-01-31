const MIN_MEDIA_WIDTH = 100;
const MIN_MEDIA_WIDTH_WITH_TEXT = 175;

export default function getMinMediaWidth(hasText?: boolean) {
  return hasText ? MIN_MEDIA_WIDTH_WITH_TEXT : MIN_MEDIA_WIDTH;
}
