import { ApiMessage } from '../../../api/tdlib/types/messages';

export function getMessageText(message: ApiMessage) {
  return message.content.text ? message.content.text.text : '%RICH_CONTENT_NOT_IMPLEMENTED%';
}

export function isOwnMessage(message: ApiMessage) {
  return message.is_outgoing;
}

export function getSendingState(message: ApiMessage) {
  if (!message.sending_state) {
    return 'succeeded';
  }

  return message.sending_state['@type'] === 'messageSendingStateFailed' ? 'failed' : 'pending';
}
