import { GlobalState } from '../../global/types';
import { ApiSticker } from '../../api/types';

export function selectIsStickerFavorite(global: GlobalState, sticker: ApiSticker) {
  const { stickers } = global.stickers.favorite;
  return stickers && stickers.some(({ id }) => id === sticker.id);
}

export function selectCurrentStickerSearch(global: GlobalState) {
  return global.stickers.search;
}

export function selectCurrentGifSearch(global: GlobalState) {
  return global.gifs.search;
}

export function selectStickerSet(global: GlobalState, id: string) {
  return global.stickers.setsById[id];
}
