export * from './users';
export * from './chats';
export * from './messages';
export * from './updates';
export * from './media';

export type ApiOnProgress = (
  progress: number, // Float between 0 and 1.
) => void;

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
