import { ApiUpdate } from '../../types';

export type OnApiUpdate = (update: ApiUpdate) => void;

export type SupportedMessageRequests = 'GetDialogsRequest' | 'GetHistoryRequest' | 'SendMessageRequest';
export type SupportedUploadRequests = 'GetFileRequest';

export type InvokeRequestPayload = ({
  namespace: 'messages';
  name: SupportedMessageRequests;
  args: AnyLiteral;
} | {
  namespace: 'upload';
  name: SupportedUploadRequests;
  args: AnyLiteral;
});
