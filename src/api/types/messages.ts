export interface ApiPhotoSize {
  '@type': 'photoSize';
  type: 's' | 'm' | 'x' | 'y';
  width: number;
  height: number;
}

export interface ApiThumbnail {
  dataUri: string;
  height: number;
  width: number;
}

export interface ApiPhoto {
  '@type': 'photo';
  has_stickers: boolean;
  thumbnail?: ApiThumbnail;
  sizes: ApiPhotoSize[];
}

export interface ApiSticker {
  '@type': 'sticker';
  id: string;
  emoji: string;
  is_animated: boolean;
  width?: number;
  height?: number;
  thumbnail?: ApiThumbnail;
}

export interface ApiVideo {
  '@type': 'video';
  duration: number;
  width?: number;
  height?: number;
  supportsStreaming: boolean;
  isRound: boolean;
  thumbnail?: ApiThumbnail;
}

export interface ApiDocument {
  '@type': 'document';
  fileName: string;
  size: number;
  mimeType: string;
}

export interface ApiContact {
  '@type': 'contact';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userId: number;
}

export interface ApiAction {
  '@type': 'action';
  text: string;
}

export interface ApiMessageForwardInfo {
  '@type': 'messageForwardInfo';
  from_chat_id?: number;
  from_message_id?: number;
  origin: {
    '@type': 'messageForwardOriginUser';
    sender_user_id: number;
    sender_user_name?: string;
  };
}

export interface ApiMessageEntity {
  className: string;
  offset: number;
  length: number;
  user_id?: number;
  url?: string;
}

export interface ApiFormattedText {
  '@type': 'formattedText';
  text: string;
  entities?: ApiMessageEntity[];
}

export interface ApiMessage {
  id: number;
  chat_id: number;
  content: {
    // TODO Enum
    '@type': string;
    text?: ApiFormattedText;
    photo?: ApiPhoto;
    video?: ApiVideo;
    document?: ApiDocument;
    sticker?: ApiSticker;
    contact?: ApiContact;
    action?: ApiAction;
  };
  date: number;
  is_outgoing: boolean;
  sender_user_id: number;
  reply_to_message_id?: number;
  sending_state?: {
    '@type': 'messageSendingStatePending' | 'messageSendingStateFailed';
  };
  forward_info?: ApiMessageForwardInfo;
  is_deleting?: boolean;
}

export type ApiMessageOutgoingStatus = 'read' | 'succeeded' | 'pending' | 'failed';
