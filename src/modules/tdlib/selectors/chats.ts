import { ApiChat } from '../../../api/tdlib/types';
import { GlobalState } from '../../../store/types';
import { getChatPhotoId } from '../helpers';

export function selectChat(global: GlobalState, chatId: number) {
  return global.chats.byId[chatId];
}

export function selectChatScrollOffset(global: GlobalState, chatId: number) {
  return global.chats.scrollOffsetById[chatId];
}

export function selectChatPhotoUrl(global: GlobalState, chat: ApiChat) {
  const fileId = getChatPhotoId(chat);

  if (!fileId) {
    return null;
  }

  const file = global.files.byId[fileId];

  if (!file || !file.blobUrl) {
    return null;
  }

  return file && file.blobUrl ? file.blobUrl : null;
}
