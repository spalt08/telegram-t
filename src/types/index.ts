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
  messageTextSize: number;
  animationLevel: 0 | 1 | 2;
  messageSendKeyCombo: 'enter' | 'ctrl-enter';
  language: 'en' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'es' | 'uk';
  customChatBackground?: {
    slug: string;
    blobUrl: string;
  };
  isBackgroundBlurred?: boolean;
}

export type IAnchorPosition = {
  x: number;
  y: number;
};

export enum SettingsScreens {
  Main,
  EditProfile,
  Notifications,
  Language,
  General,
  GeneralChatBackground,
  Privacy,
  PrivacyPhoneNumber,
  PrivacyLastSeen,
  PrivacyProfilePhoto,
  PrivacyForwarding,
  PrivacyGroupChats,
  PrivacyActiveSessions,
  PrivacyBlockedUsers,
  Folders,
  FoldersCreateFolder,
  FoldersEditFolder,
  FoldersIncludedChats,
  FoldersExcludedChats,
}

export type StickerSetOrRecent = Pick<ApiStickerSet, (
  'id' | 'title' | 'count' | 'stickers' | 'hasThumbnail' | 'isAnimated'
)>;

export enum LeftColumnContent {
  ChatList,
  RecentChats,
  GlobalSearch,
  Settings,
  Contacts,
  Archived,
  NewChannel,
  NewGroupStep1,
  NewGroupStep2,
}

export enum RightColumnContent {
  ChatInfo,
  UserInfo,
  Statistics,
  Search,
  StickerSearch,
  GifSearch,
  Forward,
  PollResults,
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

export enum ProfileEditProgress {
  Idle,
  InProgress,
  Complete,
  Error,
}
