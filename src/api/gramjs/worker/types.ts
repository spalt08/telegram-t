import { ApiUpdate } from '../../types';
import { Methods, MethodArgs, MethodResponse } from '../methods/types';

export type ThenArg<T> = T extends Promise<infer U> ? U : T;

export type WorkerMessageData = {
  type: 'update';
  update: ApiUpdate;
} | {
  messageId: number;
  type: 'methodResponse';
  response?: ThenArg<MethodResponse<keyof Methods>>;
  error?: { message: string };
} | {
  type: 'unhandledError';
  error?: { message: string };
};

export interface WorkerMessageEvent {
  data: WorkerMessageData;
}

export type OriginMessageData = {
  type: 'initApi';
  args: {
    sessionId: string;
  };
} | {
  messageId?: number;
  type: 'callMethod';
  name: keyof Methods;
  args: MethodArgs<keyof Methods>;
};

export interface OriginMessageEvent {
  data: OriginMessageData;
}
