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
  localMediaHash?: string;
}

export interface ApiStickerSet {
  archived?: true;
  isAnimated?: true;
  installedDate?: number;
  id: string;
  accessHash: string;
  title: string;
  thumbnail?: ApiThumbnail;
  count: number;
  hash: number;
  stickers: ApiSticker[];
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

export interface ApiAudio {
  size: number;
  mimeType: string;
  fileName: string;
  duration: number;
  performer?: string;
  title?: string;
}

export interface ApiVoice {
  duration: number;
  waveform?: number[];
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

export interface PollAnswer {
  text: string;
  option: Buffer;
}

export interface PollAnswerVote {
  chosen?: true;
  correct?: true;
  option: Buffer;
  voters: number;
}

export interface ApiPoll {
  id: number;
  summary: {
    closed?: true;
    publicVoters?: true;
    multipleChoice?: true;
    quiz?: true;
    question: string;
    answers: PollAnswer[];
  };
  results: {
    min?: true;
    results?: PollAnswerVote[];
    totalVoters?: number;
    recentVoters?: number[];
  };
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
  hasDocument?: true;
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
    poll?: ApiPoll;
    action?: ApiAction;
    webPage?: ApiWebPage;
    audio?: ApiAudio;
    voice?: ApiVoice;
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
  isMediaUnread?: boolean;
}

export type ApiMessageOutgoingStatus = 'read' | 'succeeded' | 'pending' | 'failed';

export type ApiMessageSearchMediaType = 'media' | 'document' | 'webPage' | 'audio';
