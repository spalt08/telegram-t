import { ApiFile } from './files';

export interface ApiPhotoSize {
  '@type': 'photoSize';
  type: 's' | 'm' | 'x' | 'y';
  width: number;
  height: number;
  // TdLib only.
  photo?: ApiFile;
}

export interface ApiPhotoCachedSize {
  '@type': 'photoCachedSize';
  dataUri: string;
  type: 'm' | 'x' | 'y';
  width: number;
  height: number;
}

export interface ApiMiniThumbnail {
  '@type': 'minithumbnail';
  data: string;
  height: number;
  width: number;
}

export interface ApiPhoto {
  '@type': 'photo';
  has_stickers: boolean;
  minithumbnail?: ApiMiniThumbnail;
  sizes: ApiPhotoSize[];
}

export interface ApiSticker {
  '@type': 'sticker';
  emoji: string;
  is_animated: boolean;
  width?: number;
  height?: number;
  thumbnail?: ApiPhotoCachedSize;
  // TdLib only.
  sticker?: ApiPhotoSize;
}

export interface ApiVideo {
  '@type': 'video';
  duration: number;
  minithumbnail?: ApiMiniThumbnail;
}

export interface ApiDocument {
  '@type': 'document';
  fileName: string;
  size: number;
  mimeType: string;
}

export interface ApiMessageForwardInfo {
  '@type': 'messageForwardInfo';
  from_chat_id?: number;
  from_message_id?: number;
  origin: {
    '@type': 'messageForwardOriginUser';
    sender_user_id: number;
    // GramJS only.
    sender_user_name?: string;
  };
}

export interface ApiMessage {
  id: number;
  chat_id: number;
  content: {
    // TODO Enum
    '@type': string;
    text?: {
      '@type': 'formattedText';
      text: string;
    };
    photo?: ApiPhoto;
    video?: ApiVideo;
    document?: ApiDocument;
    caption?: {
      '@type': 'formattedText';
      text: string;
    };
    sticker?: ApiSticker;
  };
  date: number;
  is_outgoing: boolean;
  sender_user_id: number;
  reply_to_message_id?: number;
  sending_state?: {
    '@type': 'messageSendingStatePending' | 'messageSendingStateFailed';
  };
  forward_info?: ApiMessageForwardInfo;
}
