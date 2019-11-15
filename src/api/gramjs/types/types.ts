import { TdLibUpdate } from '../../tdlib/types/index';

export type OnUpdate = (update: TdLibUpdate) => void;

type SupportedRequests = 'GetDialogsRequest' | 'GetHistoryRequest';

type EnhancerName = 'buildPeerByApiChatId';

export type OriginMessageData = ({
  type: 'init';
} | {
  type: 'invokeRequest';
  name: SupportedRequests;
  args: AnyLiteral;
  enhancers?: Record<string, [EnhancerName, any]>;
} | {
  type: 'provideAuthPhoneNumber';
  phoneNumber: string;
} | {
  type: 'provideAuthCode';
  code: string;
} | {
  type: 'provideAuthPassword';
  password: string;
}) & {
  messageId?: number;
};

export interface OriginMessageEvent extends MessageEvent {
  data: OriginMessageData;
}

export type WorkerMessageGramJsUpdate = {
  type: 'gramJsUpdate';
  constructorName: string;
  update: AnyLiteral;
};

export type WorkerMessageApiUpdate = {
  type: 'apiUpdate';
  update: AnyLiteral;
};

export type WorkerMessageResponse = {
  messageId: number;
  type: 'invokeResponse';
  name: SupportedRequests;
  result?: AnyLiteral;
  error?: AnyLiteral;
};

export type WorkerMessageData = WorkerMessageGramJsUpdate | WorkerMessageApiUpdate | WorkerMessageResponse;

export interface WorkerMessageEvent extends MessageEvent {
  data: WorkerMessageData;
}

export interface SendToWorker {
  (message: OriginMessageData, shouldWaitForResponse?: boolean): Promise<WorkerMessageResponse['result']> | null;
}
