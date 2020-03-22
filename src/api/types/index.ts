export * from './users';
export * from './chats';
export * from './messages';
export * from './updates';
export * from './media';

export type ApiOnProgress = (
  progress: number, // Float between 0 and 1.
) => void;

export interface ApiAttachment {
  file: File;
  quick?: {
    blobUrl: string;
    width: number;
    height: number;
  };
  voice?: {
    duration: number;
    waveform: number[];
  };
}
