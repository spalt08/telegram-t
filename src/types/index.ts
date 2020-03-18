import { ApiMessage } from '../api/types';

export enum LoadMoreDirection {
  Backwards,
  Forwards,
  Both,
  Around,
}

export enum FocusDirection {
  Up,
  Down,
  Static,
}

export interface IAlbum {
  albumId: string;
  messages: ApiMessage[];
}
