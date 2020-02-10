export interface ApiPhotoSize {
  type: 's' | 'm' | 'x' | 'y' | 'z';
  width: number;
  height: number;
}

export interface ApiThumbnail {
  dataUri: string;
  height: number;
  width: number;
}

export interface ApiPhoto {
  thumbnail?: ApiThumbnail;
  sizes: ApiPhotoSize[];
  blobUrl?: string;
}

export interface ApiSticker {
  id: string;
  emoji: string;
  is_animated: boolean;
  width?: number;
  height?: number;
  thumbnail?: ApiThumbnail;
}

export interface ApiVideo {
  duration: number;
  width?: number;
  height?: number;
  supportsStreaming?: boolean;
  isRound?: boolean;
  thumbnail?: ApiThumbnail;
  blobUrl?: string;
}

export interface ApiDocument {
  fileName: string;
  size: number;
  mimeType: string;
}

export interface ApiContact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userId: number;
}

export interface ApiAction {
  text: string;
  targetUserId?: number;
}

export interface ApiWebPage {
  id: number;
  url: string;
  displayUrl: string;
  siteName?: string;
  title?: string;
  description?: string;
  photo?: ApiPhoto;
}

export interface ApiMessageForwardInfo {
  '@type': 'messageForwardInfo';
  from_chat_id?: number;
  from_message_id?: number;
  origin: {
    '@type': 'messageForwardOriginUser';
    sender_user_id?: number;
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
    text?: ApiFormattedText;
    photo?: ApiPhoto;
    video?: ApiVideo;
    document?: ApiDocument;
    sticker?: ApiSticker;
    contact?: ApiContact;
    action?: ApiAction;
    webPage?: ApiWebPage;
  };
  date: number;
  is_outgoing: boolean;
  sender_user_id?: number;
  reply_to_message_id?: number;
  sending_state?: {
    '@type': 'messageSendingStatePending' | 'messageSendingStateFailed';
  };
  forward_info?: ApiMessageForwardInfo;
  is_deleting?: boolean;
  prev_local_id?: number;
  views?: number;
  isEdited?: boolean;
}

export type ApiMessageOutgoingStatus = 'read' | 'succeeded' | 'pending' | 'failed';
