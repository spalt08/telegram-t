import { ApiChat } from '../../api/types';
import { GlobalState } from '../../store/types';
import { getChatPhotoKey } from '../helpers';

export function selectChat(global: GlobalState, chatId: number) {
  return global.chats.byId[chatId];
}

export function selectChatScrollOffset(global: GlobalState, chatId: number) {
  return global.chats.scrollOffsetById[chatId];
}

export function selectChatPhotoUrl(global: GlobalState, chat: ApiChat) {
  const fileKey = getChatPhotoKey(chat);

  if (!fileKey) {
    return null;
  }

  const file = global.files.byKey[fileKey];

  if (!file || !file.dataUri) {
    return null;
  }

  return file && file.dataUri ? file.dataUri : null;
}

export function selectChatGroupId(chat: ApiChat) {
  return chat.type.basic_group_id || chat.type.supergroup_id;
}
