import { ApiMessage, ApiStickerSet } from '../api/types';

export enum LoadMoreDirection {
  Backwards,
  Forwards,
  Both,
  Around,
}

export enum FocusDirection {
  Up,
  Down,
  Static,
}

export interface IAlbum {
  albumId: string;
  messages: ApiMessage[];
}

export interface ISettings extends Record<string, any> {
  animationLevel: 0 | 1 | 2;
}

export type StickerSetOrRecent = Pick<ApiStickerSet, 'id' | 'title' | 'count' | 'stickers'>;

export enum LeftColumnContent {
  ChatList,
  RecentChats,
  GlobalSearch,
  Settings,
  Contacts,
  NewChannel,
  NewGroupStep1,
  NewGroupStep2,
}

export enum MediaViewerOrigin {
  Inline,
  SharedMedia,
  ProfileAvatar,
  MiddleHeaderAvatar,
  Album,
}

export enum ChatCreationProgress {
  Idle,
  InProgress,
  Complete,
  Error,
}
