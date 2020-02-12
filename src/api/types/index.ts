export * from './users';
export * from './chats';
export * from './messages';
export * from './updates';

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
