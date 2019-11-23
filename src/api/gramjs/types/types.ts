import { ApiUpdate } from '../../types';

export type OnApiUpdate = (update: ApiUpdate) => void;

export type SupportedMessageRequests = 'GetDialogsRequest' | 'GetHistoryRequest' | 'SendMessageRequest';
export type SupportedUploadRequests = 'GetFileRequest';

type EnhancerName = 'buildInputPeer' | 'buildInputPeerPhotoFileLocation' | 'generateRandomBigInt';

export type InvokeRequestPayload = ({
  namespace: 'messages';
  name: SupportedMessageRequests;
  args: AnyLiteral;
  enhancers?: Record<string, [EnhancerName, any?]>;
} | {
  namespace: 'upload';
  name: SupportedUploadRequests;
  args: AnyLiteral;
  enhancers?: Record<string, [EnhancerName, any]>;
});
