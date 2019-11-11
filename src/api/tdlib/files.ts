import { ApiChat, ApiFile, ApiUser } from './types';
import FileStore from './legacy/Stores/FileStore';

// @magic
export const THUMBNAIL_PRIORITY = 32;

function getFileSrc(file: ApiFile) {
  const blob = getBlob(file);

  return FileStore.getBlobUrl(blob) || '';
}

function getBlob(file: ApiFile) {
  return file ? FileStore.getBlob(file.id) || file.blob : null;
}

function loadUserPhoto(user: ApiUser) {
  const { profile_photo, id: userId } = user;

  if (!profile_photo) {
    return;
  }

  const { small: file } = profile_photo;

  if (!file) return;

  const { id } = file;
  const storedFile = FileStore.get(id) || file;
  const store = FileStore.getStore();
  const blob = file.blob || FileStore.getBlob(id);
  if (blob) return;

  FileStore.getLocalFile(
    store,
    storedFile,
    null,
    () => FileStore.updateUserPhotoBlob(userId, id),
    () => FileStore.getRemoteFile(id, THUMBNAIL_PRIORITY, user),
  );
}

function loadChatPhoto(chat: ApiChat) {
  const { photo, id: chatId } = chat;

  if (!photo) {
    return;
  }

  const { small: file } = photo;

  const { id } = file;
  const storedFile = FileStore.get(id) || file;
  const store = FileStore.getStore();
  const blob = file.blob || FileStore.getBlob(id);
  if (blob) return;

  FileStore.getLocalFile(
    store,
    storedFile,
    null,
    () => FileStore.updateChatPhotoBlob(chatId, id),
    () => FileStore.getRemoteFile(id, THUMBNAIL_PRIORITY, chat),
  );
}

export {
  loadChatPhoto,
  loadUserPhoto,
  getFileSrc,
};
