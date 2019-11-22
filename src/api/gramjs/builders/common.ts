export function buildPhoto(entity: MTP.user | MTP.chat) {
  if (!entity.photo) {
    return undefined;
  }

  const { photoSmall, photoBig } = entity.photo as (MTP.userProfilePhoto | MTP.chatPhoto);

  return {
    small: photoSmall as MTP.FileLocationNext as MTP.fileLocationToBeDeprecated,
    big: photoBig as MTP.FileLocationNext as MTP.fileLocationToBeDeprecated,
  };
}
