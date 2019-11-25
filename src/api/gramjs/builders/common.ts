export function buildPhoto(entity: MTP.user | MTP.chat) {
  if (!entity.photo) {
    return undefined;
  }

  const { photoSmall, photoBig, dcId } = entity.photo as (MTPNext.UserProfilePhoto | MTPNext.ChatPhoto);

  return {
    small: {
      ...photoSmall,
      dcId,
    },
    big: {
      ...photoBig,
      dcId,
    },
  };
}
