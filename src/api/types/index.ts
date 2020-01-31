export * from './users';
export * from './chats';
export * from './messages';
export * from './updates';

export interface ApiAttachment {
  file: File;
  photo?: {
    width: number;
    height: number;
    blobUrl: string;
  };
}
