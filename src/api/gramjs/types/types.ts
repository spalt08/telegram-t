import { TdLibUpdate } from '../../tdlib/types';

export type OnUpdate = (update: TdLibUpdate) => void;

export type SupportedMessageRequests = 'GetDialogsRequest' | 'GetHistoryRequest' | 'SendMessageRequest';
export type SupportedUploadRequests = 'GetFileRequest';

type EnhancerName = 'buildInputPeerByApiChatId' | 'buildInputPeerPhotoFileLocation' | 'generateRandomBigInt';

export type OriginMessageData = ({
  type: 'init';
  sessionId: string;
} | {
  type: 'invokeRequest';
  namespace: 'messages';
  name: SupportedMessageRequests;
  args: AnyLiteral;
  enhancers?: Record<string, [EnhancerName, any?]>;
} | {
  type: 'invokeRequest';
  namespace: 'upload';
  name: SupportedUploadRequests;
  args: AnyLiteral;
  enhancers?: Record<string, [EnhancerName, any]>;
} | {
  type: 'provideAuthPhoneNumber';
  phoneNumber: string;
  shouldRememberMe?: boolean;
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
  name: SupportedMessageRequests | SupportedUploadRequests;
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
