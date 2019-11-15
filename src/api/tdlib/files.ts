import { ApiChat, ApiFile, ApiUser } from './types';
import FileStore from './legacy/Stores/FileStore';

// @magic
export const THUMBNAIL_PRIORITY = 32;

export function getBlob(file: ApiFile) {
  return file ? FileStore.getBlob(file.id) || file.blob : null;
}

export function loadUserPhoto(user: ApiUser) {
  const { profile_photo, id: userId } = user;

  if (!profile_photo) {
    return null;
  }

  const { small: file } = profile_photo;

  if (!file) return null;

  const { id } = file;
  const storedFile = FileStore.get(id) || file;
  const store = FileStore.getStore();
  const blob = file.blob || FileStore.getBlob(id);
  if (blob) return blob;

  return FileStore.getLocalFile(
    store,
    storedFile,
    null,
    () => FileStore.updateUserPhotoBlob(userId, id),
    () => FileStore.getRemoteFile(id, THUMBNAIL_PRIORITY, user),
  ).then(() => {
    return file.blob || FileStore.getBlob(id);
  });
}

export function loadChatPhoto(chat: ApiChat) {
  const { photo, id: chatId } = chat;

  if (!photo) {
    return null;
  }

  const { small: file } = photo;

  if (!file) return null;

  const { id } = file;
  const storedFile = FileStore.get(id) || file;
  const store = FileStore.getStore();
  const blob = file.blob || FileStore.getBlob(id);
  if (blob) return blob;

  return FileStore.getLocalFile(
    store,
    storedFile,
    null,
    () => FileStore.updateChatPhotoBlob(chatId, id),
    () => FileStore.getRemoteFile(id, THUMBNAIL_PRIORITY, chat),
  ).then(() => {
    return file.blob || FileStore.getBlob(id);
  });
}
