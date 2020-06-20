import { Api as GramJs } from '../../../lib/gramjs';

import { buildApiWallpaper } from '../apiBuilders/misc';
import localDb from '../localDb';

import { invokeRequest, uploadFile } from './client';
import { ApiWallpaper } from '../../types';

export function updateProfile({
  firstName,
  lastName,
  about,
}: {
  firstName?: string;
  lastName?: string;
  about?: string;
}) {
  // This endpoint handles empty strings with an unexpected error, so we replace them with `undefined`
  return invokeRequest(new GramJs.account.UpdateProfile({
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    about: about || undefined,
  }));
}

export function checkUsername(username: string) {
  return invokeRequest(new GramJs.account.CheckUsername({ username }));
}

export function updateUsername(username: string) {
  return invokeRequest(new GramJs.account.UpdateUsername({ username }));
}

export async function updateProfilePhoto(file: File) {
  const inputFile = await uploadFile(file);
  return invokeRequest(new GramJs.photos.UploadProfilePhoto({
    file: inputFile,
  }));
}

export async function uploadProfilePhoto(file: File) {
  const inputFile = await uploadFile(file);
  await invokeRequest(new GramJs.photos.UploadProfilePhoto({
    file: inputFile,
  }));
}

export async function fetchWallpapers(hash: number) {
  const result = await invokeRequest(new GramJs.account.GetWallPapers({ hash }));

  if (!result || result instanceof GramJs.account.WallPapersNotModified) {
    return undefined;
  }

  const filteredWallpapers = result.wallpapers.filter((wallpaper) => {
    if (
      !(wallpaper instanceof GramJs.WallPaper)
      || !(wallpaper.document instanceof GramJs.Document)
    ) {
      return false;
    }

    return !wallpaper.pattern && wallpaper.document.mimeType !== 'application/x-tgwallpattern';
  }) as GramJs.WallPaper[];

  filteredWallpapers.forEach((wallpaper) => {
    localDb.documents[String(wallpaper.document.id)] = wallpaper.document as GramJs.Document;
  });

  return {
    hash: result.hash,
    wallpapers: filteredWallpapers.map(buildApiWallpaper).filter<ApiWallpaper>(Boolean as any),
  };
}
