import { ApiDocument } from './messages';

export * from './users';
export * from './chats';
export * from './messages';
export * from './updates';
export * from './media';

export interface ApiOnProgress {
  (
    progress: number, // Float between 0 and 1.
    ...args: any[]
  ): void;

  isCanceled?: boolean;
  acceptsBuffer?: boolean;
}

export interface ApiAttachment {
  blobUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  quick?: {
    width: number;
    height: number;
    duration?: number;
  };
  voice?: {
    duration: number;
    waveform: number[];
  };
  previewBlobUrl?: string;
}

export interface ApiWallpaper {
  slug: string;
  document: ApiDocument;
}
