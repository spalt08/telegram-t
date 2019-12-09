import { ApiUpdate } from '../types';
import sdk from './sdk';

export type Sdk = typeof sdk;
export type SdkArgs<N extends keyof Sdk> = Parameters<Sdk[N]>[0];
export type SdkResponse<N extends keyof Sdk> = ReturnType<Sdk[N]>;

export type ThenArg<T> = T extends Promise<infer U> ? U : T;

export type WorkerMessageData = {
  type: 'update';
  update: ApiUpdate;
} | {
  messageId: number;
  type: 'sdkResponse';
  response?: ThenArg<SdkResponse<keyof Sdk>>;
  error?: AnyLiteral;
};

export interface WorkerMessageEvent {
  data: WorkerMessageData;
}

export type OriginMessageData = {
  type: 'init';
  args: {
    sessionId: string;
  };
} | {
  messageId?: number;
  type: 'callSdk';
  name: keyof Sdk;
  args: SdkArgs<keyof Sdk>;
};

export interface OriginMessageEvent {
  data: OriginMessageData;
}
