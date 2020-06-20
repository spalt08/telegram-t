import { Api as GramJs } from '../../../lib/gramjs';

import { ApiWallpaper } from '../../types';

import { buildApiDocument } from './messages';

export function buildApiWallpaper(wallpaper: GramJs.TypeWallPaper): ApiWallpaper | undefined {
  if (wallpaper instanceof GramJs.WallPaperNoFile) {
    // TODO: Plain color wallpapers
    return undefined;
  }

  const { slug } = wallpaper;

  const document = buildApiDocument(wallpaper.document);

  if (!document) {
    return undefined;
  }

  return {
    slug,
    document,
  };
}
