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
  id: string;
  duration: number;
  fileName: string;
  width?: number;
  height?: number;
  supportsStreaming?: boolean;
  isRound?: boolean;
  isGif?: boolean;
  thumbnail?: ApiThumbnail;
  blobUrl?: string;
  size: number;
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
  timestamp?: number;
  mimeType: string;
  thumbnail?: ApiThumbnail;
  previewBlobUrl?: string;
}

export interface ApiContact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userId: number;
}

export interface PollAnswer {
  text: string;
  option: string;
}

export interface PollAnswerVote {
  chosen?: true;
  correct?: true;
  option: string;
  voters: number;
}

export interface ApiPoll {
  id: string;
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

export type ApiNewPoll = ApiPoll['summary'];

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
  type: string;
  offset: number;
  length: number;
  userId?: number;
  url?: string;
}

export enum ApiMessageEntityTypes {
  Bold = 'MessageEntityBold',
  Blockquote = 'MessageEntityBlockquote',
  BotCommand = 'MessageEntityBotCommand',
  Cashtag = 'MessageEntityCashtag',
  Code = 'MessageEntityCode',
  Email = 'MessageEntityEmail',
  Hashtag = 'MessageEntityHashtag',
  Italic = 'MessageEntityItalic',
  MentionName = 'MessageEntityMentionName',
  Mention = 'MessageEntityMention',
  Phone = 'MessageEntityPhone',
  Pre = 'MessageEntityPre',
  Strike = 'MessageEntityStrike',
  TextUrl = 'MessageEntityTextUrl',
  Url = 'MessageEntityUrl',
  Underline = 'MessageEntityUnderline',
  Unknown = 'MessageEntityUnknown',
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
  groupedId?: string;
  hasMention?: true;
}

export type ApiMessageOutgoingStatus = 'read' | 'succeeded' | 'pending' | 'failed';

export type ApiMessageSearchType = 'text' | 'media' | 'documents' | 'links' | 'audio';
